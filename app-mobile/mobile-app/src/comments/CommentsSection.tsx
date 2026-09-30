import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import { useRequireAccount } from '../auth/AccountWall';
import { useAccess } from '../access/Access';
import { Icon, type IconName } from '../components/Icons';
import { ProfileAvatar } from '../components/ProfileAvatar';
import type { ContentType } from '../data/contentAccess';
import { relativeTime } from '../data/relativeTime';
import { useOwnProfile } from '../profile/ownProfile';
import { colors, typography } from '../theme/tokens';
import {
  commentErrorMessage,
  deleteComment,
  editComment,
  likeComment,
  listComments,
  listReplies,
  PAGE_SIZE,
  postComment,
  reportComment,
  type CommentSort,
  type ContentComment,
} from './commentsApi';

const GOLD = colors.accentGoldBright;
const BUBBLE = 'rgba(237,227,212,.08)';

/**
 * Commentaires façon Facebook (cdc-commentaires.md, ajusté le 2026-09-30 à
 * la demande de Yannick : "pas de fenêtre, gérés identiquement à
 * Facebook"). Tout se passe dans la page : zone "Écrire un commentaire…",
 * bulles avec nom en gras, "il y a 2 h · J'aime · Répondre" sous la bulle,
 * pastille 👍 + compteur sur le coin de la bulle, réponses en retrait
 * ("Voir les 3 réponses") avec leur propre zone de réponse. Un seul fil par
 * contenu, partagé entre la fiche et le lecteur vidéo.
 */
export function CommentsSection({ type, slug }: { type: ContentType; slug: string }) {
  const { session } = useAuth();
  const requireAccount = useRequireAccount();
  const { requireSubscription } = useAccess();
  const me = useOwnProfile();
  const [installed, setInstalled] = useState(true);
  const [sort, setSort] = useState<CommentSort>('pertinents');
  const [items, setItems] = useState<ContentComment[]>([]);
  const [total, setTotal] = useState(0);
  const [canPost, setCanPost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [replies, setReplies] = useState<Record<string, { open: boolean; loading: boolean; items: ContentComment[] }>>({});
  const [replyTo, setReplyTo] = useState<{ rootId: string; parentId: string; pseudo: string } | null>(null);
  const [editing, setEditing] = useState<ContentComment | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<ContentComment | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await listComments(type, slug, sort, 0);
    setLoading(false);
    if (error === 'non_installe') return setInstalled(false);
    if (!data) return;
    setItems(data.items);
    setTotal(data.total);
    setCanPost(data.peut_commenter);
    setHasMore(data.items.length === PAGE_SIZE);
  }, [type, slug, sort]);

  useEffect(() => {
    load();
  }, [load, session?.user?.id]);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice((m) => (m === msg ? null : m)), 3500);
  };

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const { data } = await listComments(type, slug, sort, items.length);
    setLoadingMore(false);
    if (!data) return;
    setItems((list) => [...list, ...data.items.filter((c) => !list.some((x) => x.id === c.id))]);
    setHasMore(data.items.length === PAGE_SIZE);
  };

  // Modifie un commentaire, qu'il soit de premier niveau ou une réponse.
  const patch = (id: string, fn: (c: ContentComment) => ContentComment) => {
    setItems((list) => list.map((c) => (c.id === id ? fn(c) : c)));
    setReplies((map) => {
      const next = { ...map };
      for (const k of Object.keys(next)) next[k] = { ...next[k], items: next[k].items.map((c) => (c.id === id ? fn(c) : c)) };
      return next;
    });
  };

  const toggleReplies = async (c: ContentComment) => {
    const cur = replies[c.id];
    if (cur?.open) return setReplies((m) => ({ ...m, [c.id]: { ...cur, open: false } }));
    setReplies((m) => ({ ...m, [c.id]: { open: true, loading: true, items: cur?.items ?? [] } }));
    const { data } = await listReplies(c.id);
    setReplies((m) => ({ ...m, [c.id]: { open: true, loading: false, items: data ?? [] } }));
  };

  // Garde d'écriture : compte connecté, puis accès au contenu.
  const guard = (action: () => void) => {
    if (!session) return requireAccount(undefined, 'comment');
    if (!canPost) return requireSubscription(() => {}, type);
    action();
  };

  const onLike = (c: ContentComment) =>
    guard(async () => {
      const like = !c.liked;
      patch(c.id, (x) => ({ ...x, liked: like, like_count: Math.max(0, x.like_count + (like ? 1 : -1)) }));
      const { data, error } = await likeComment(c.id, like);
      if (data) patch(c.id, (x) => ({ ...x, liked: data.liked, like_count: data.like_count }));
      else {
        patch(c.id, (x) => ({ ...x, liked: !like, like_count: Math.max(0, x.like_count + (like ? -1 : 1)) }));
        flash(commentErrorMessage(error));
      }
    });

  const onReply = (c: ContentComment) =>
    guard(() => {
      const rootId = c.parent_id ?? c.id;
      setEditing(null);
      setReplyTo({ rootId, parentId: c.id, pseudo: c.author?.pseudo ?? '' });
      // Les réponses du fil s'ouvrent pour voir où la réponse s'insère.
      if (!replies[rootId]?.open) {
        const root = items.find((x) => x.id === rootId);
        if (root && root.reply_count > 0) toggleReplies(root);
      }
    });

  // Publication d'un commentaire (premier niveau) ou d'une réponse.
  const submit = async (value: string, target: typeof replyTo): Promise<boolean> => {
    const { comment, error } = await postComment(type, slug, value, target?.parentId ?? null);
    if (!comment) {
      flash(commentErrorMessage(error));
      return false;
    }
    if (target) {
      const rootId = target.rootId;
      setReplies((m) => ({ ...m, [rootId]: { open: true, loading: false, items: [...(m[rootId]?.items ?? []), comment] } }));
      patch(rootId, (x) => ({ ...x, reply_count: x.reply_count + 1 }));
      setReplyTo(null);
    } else {
      setItems((list) => [comment, ...list]);
      if (comment.statut === 'publie') setTotal((n) => n + 1);
    }
    if (comment.statut !== 'publie') flash('Ton commentaire est en attente de vérification.');
    return true;
  };

  const saveEdit = async (value: string): Promise<boolean> => {
    if (!editing) return false;
    const { comment, error } = await editComment(editing.id, value);
    if (!comment) {
      flash(commentErrorMessage(error));
      return false;
    }
    patch(comment.id, () => comment);
    setEditing(null);
    return true;
  };

  const onDelete = async (c: ContentComment) => {
    setMenuFor(null);
    const { error } = await deleteComment(c.id);
    if (error) return flash(commentErrorMessage(error));
    if (c.parent_id) {
      const pid = c.parent_id;
      setReplies((m) => ({ ...m, [pid]: { ...m[pid], items: m[pid].items.filter((x) => x.id !== c.id) } }));
      patch(pid, (x) => ({ ...x, reply_count: Math.max(0, x.reply_count - 1) }));
    } else if (c.reply_count > 0) {
      patch(c.id, (x) => ({ ...x, statut: 'supprime', texte: null }));
    } else {
      setItems((list) => list.filter((x) => x.id !== c.id));
    }
    if (c.statut === 'publie' && !c.parent_id) setTotal((n) => Math.max(0, n - 1));
  };

  const onReport = async (c: ContentComment) => {
    setMenuFor(null);
    const { error } = await reportComment(c.id);
    flash(error ? commentErrorMessage(error) : 'Merci, le commentaire a été signalé à l’équipe.');
  };

  if (!installed) return null;

  const renderComment = (c: ContentComment, isReply: boolean) => (
    <View key={c.id}>
      {editing?.id === c.id ? (
        <View style={[styles.row, isReply && styles.rowReply]}>
          <ProfileAvatar value={c.author?.avatar_url} size={isReply ? 28 : 36} name={c.author?.pseudo} />
          <View style={{ flex: 1 }}>
            <Composer initial={c.texte ?? ''} placeholder="Modifier ton commentaire…" autoFocus onSubmit={saveEdit} onCancel={() => setEditing(null)} />
          </View>
        </View>
      ) : (
        <CommentRow
          comment={c}
          isReply={isReply}
          onLike={() => onLike(c)}
          onReply={() => onReply(c)}
          onMenu={() => (session ? setMenuFor(c) : requireAccount(undefined, 'comment'))}
        />
      )}
    </View>
  );

  return (
    <View style={styles.section}>
      {/* En-tête : total + tri */}
      <View style={styles.head}>
        <Icon name="chat" size={18} color={GOLD} />
        <Text style={styles.title}>
          {total} commentaire{total > 1 ? 's' : ''}
        </Text>
        <View style={{ flex: 1 }} />
        {total > 1 && (
          <Pressable
            onPress={() => setSort((s) => (s === 'pertinents' ? 'recents' : 'pertinents'))}
            hitSlop={8}
            style={styles.sortBtn}
            accessibilityRole="button"
          >
            <Text style={styles.sortText}>{sort === 'pertinents' ? 'Les plus pertinents' : 'Les plus récents'}</Text>
            <View style={{ transform: [{ rotate: '90deg' }] }}>
              <Icon name="chevronRight" size={12} color={colors.textMuted} strokeWidth={2.4} />
            </View>
          </Pressable>
        )}
      </View>

      {/* Nouveau commentaire */}
      {session && !canPost ? (
        <Pressable style={styles.locked} onPress={() => requireSubscription(() => {}, type)} accessibilityRole="button">
          <Icon name="lock" size={16} color={GOLD} />
          <Text style={styles.lockedText}>Débloque ce contenu pour participer à la discussion</Text>
        </Pressable>
      ) : (
        <View style={styles.row}>
          {session ? (
            <ProfileAvatar value={me?.avatar ?? null} size={36} name={me?.pseudo} />
          ) : (
            <View style={styles.guestAvatar}>
              <Icon name="user" size={16} color={GOLD} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            {session ? (
              <Composer placeholder="Écrire un commentaire…" onSubmit={(v) => submit(v, null)} />
            ) : (
              <Pressable style={styles.fakeInput} onPress={() => requireAccount(undefined, 'comment')} accessibilityRole="button">
                <Text style={styles.fakeInputText}>Écrire un commentaire…</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {!!notice && <Text style={styles.notice}>{notice}</Text>}

      {/* Fil */}
      {loading ? (
        <ActivityIndicator color={GOLD} style={{ marginVertical: 18 }} />
      ) : (
        <View style={styles.list}>
          {items.map((c) => {
            const r = replies[c.id];
            const replying = replyTo?.rootId === c.id;
            return (
              <View key={c.id}>
                {renderComment(c, false)}
                <View style={styles.repliesBlock}>
                  {c.reply_count > 0 && (
                    <Pressable onPress={() => toggleReplies(c)} style={styles.repliesToggle} accessibilityRole="button">
                      <View style={styles.repliesLine} />
                      <Text style={styles.repliesToggleText}>
                        {r?.open ? 'Masquer les réponses' : `Voir ${c.reply_count > 1 ? `les ${c.reply_count} réponses` : 'la réponse'}`}
                      </Text>
                    </Pressable>
                  )}
                  {r?.open && (r.loading ? <ActivityIndicator color={GOLD} style={{ alignSelf: 'flex-start', marginVertical: 6 }} /> : r.items.map((x) => renderComment(x, true)))}
                  {replying && (
                    <View style={[styles.row, styles.rowReply]}>
                      <ProfileAvatar value={me?.avatar ?? null} size={28} name={me?.pseudo} />
                      <View style={{ flex: 1 }}>
                        <Composer
                          key={`${replyTo?.parentId}`}
                          initial={replyTo && replyTo.parentId !== c.id ? `@${replyTo.pseudo} ` : ''}
                          placeholder={`Répondre à ${replyTo?.pseudo ?? ''}…`}
                          autoFocus
                          onSubmit={(v) => submit(v.replace(new RegExp(`^@${replyTo?.pseudo ?? ''}\\s*`), ''), replyTo)}
                          onCancel={() => setReplyTo(null)}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
          {hasMore && (
            <Pressable onPress={loadMore} style={styles.more} accessibilityRole="button">
              {loadingMore ? <ActivityIndicator color={GOLD} /> : <Text style={styles.moreText}>Voir plus de commentaires</Text>}
            </Pressable>
          )}
          {items.length === 0 && <Text style={styles.empty}>Sois le premier à commenter.</Text>}
        </View>
      )}

      {/* Menu ⋯ (modifier / supprimer / signaler) */}
      <Modal visible={!!menuFor} transparent animationType="fade" onRequestClose={() => setMenuFor(null)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuFor(null)}>
          <View style={styles.menu}>
            {menuFor?.mine ? (
              <>
                <MenuItem
                  icon="pencil"
                  label="Modifier"
                  onPress={() => {
                    setReplyTo(null);
                    setEditing(menuFor);
                    setMenuFor(null);
                  }}
                />
                <MenuItem icon="trash" label="Supprimer" danger onPress={() => menuFor && onDelete(menuFor)} />
              </>
            ) : (
              <MenuItem icon="flag" label="Signaler" onPress={() => menuFor && onReport(menuFor)} />
            )}
            <MenuItem icon="close" label="Annuler" onPress={() => setMenuFor(null)} />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

/** Zone de saisie en bulle arrondie, bouton d'envoi qui apparaît dès qu'on écrit. */
function Composer({
  initial = '',
  placeholder,
  autoFocus,
  onSubmit,
  onCancel,
}: {
  initial?: string;
  placeholder: string;
  autoFocus?: boolean;
  onSubmit: (value: string) => Promise<boolean>;
  onCancel?: () => void;
}) {
  const [text, setText] = useState(initial);
  const [sending, setSending] = useState(false);
  const ref = useRef<TextInput>(null);
  useEffect(() => {
    if (autoFocus) setTimeout(() => ref.current?.focus(), 60);
  }, [autoFocus]);
  const send = async () => {
    const v = text.trim();
    if (!v || sending) return;
    setSending(true);
    const ok = await onSubmit(v);
    setSending(false);
    if (ok) setText('');
  };
  return (
    <View>
      <View style={styles.composer}>
        <TextInput
          ref={ref}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={2000}
          style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object)]}
        />
        {!!text.trim() && (
          <Pressable onPress={send} disabled={sending} hitSlop={8} style={styles.send} accessibilityRole="button" accessibilityLabel="Publier">
            {sending ? <ActivityIndicator size="small" color={GOLD} /> : <Icon name="send" size={18} color={GOLD} strokeWidth={2.2} />}
          </Pressable>
        )}
      </View>
      {!!onCancel && (
        <Pressable onPress={onCancel} hitSlop={8} style={{ alignSelf: 'flex-start' }}>
          <Text style={styles.cancel}>Annuler</Text>
        </Pressable>
      )}
    </View>
  );
}

function CommentRow({
  comment: c,
  isReply,
  onLike,
  onReply,
  onMenu,
}: {
  comment: ContentComment;
  isReply: boolean;
  onLike: () => void;
  onReply: () => void;
  onMenu: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const deleted = c.statut === 'supprime';
  const pending = c.mine && c.statut !== 'publie' && !deleted;
  const long = (c.texte?.length ?? 0) > 220;
  return (
    <View style={[styles.row, isReply && styles.rowReply]}>
      <ProfileAvatar value={deleted ? null : c.author?.avatar_url} size={isReply ? 28 : 36} name={deleted ? '·' : c.author?.pseudo} />
      <View style={{ flex: 1, alignItems: 'flex-start' }}>
        <Pressable onLongPress={onMenu} delayLongPress={350} style={styles.bubble}>
          {deleted ? (
            <Text style={styles.deleted}>Ce commentaire a été supprimé.</Text>
          ) : (
            <>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {c.author?.pseudo ?? 'Membre'}
                </Text>
                {!!c.author?.equipe && (
                  <View style={styles.teamBadge}>
                    <Text style={styles.teamText}>AFROBACK</Text>
                  </View>
                )}
              </View>
              <Text style={styles.text} numberOfLines={expanded ? undefined : 5} onPress={long ? () => setExpanded((v) => !v) : undefined}>
                {!!c.reply_to_pseudo && <Text style={styles.mention}>{c.reply_to_pseudo} </Text>}
                {c.texte}
              </Text>
              {long && !expanded && (
                <Text style={styles.seeMore} onPress={() => setExpanded(true)}>
                  Voir plus
                </Text>
              )}
            </>
          )}
          {c.like_count > 0 && !deleted && (
            <View style={styles.likeBadge}>
              <View style={styles.likeBadgeIcon}>
                <Icon name="thumbUp" size={10} color={colors.ctaTextOnGold} strokeWidth={2.6} />
              </View>
              <Text style={styles.likeBadgeText}>{c.like_count}</Text>
            </View>
          )}
        </Pressable>
        {pending && <Text style={styles.pending}>Visible par toi seul, en attente de vérification</Text>}
        {!deleted && (
          <View style={styles.actions}>
            <Text style={styles.time}>
              {relativeTime(c.created_at)}
              {c.edited ? ' · Modifié' : ''}
            </Text>
            <Pressable onPress={onLike} hitSlop={8} accessibilityRole="button" accessibilityLabel={c.liked ? "Je n'aime plus" : "J'aime"}>
              <Text style={[styles.action, c.liked && styles.actionOn]}>J'aime</Text>
            </Pressable>
            <Pressable onPress={onReply} hitSlop={8} accessibilityRole="button">
              <Text style={styles.action}>Répondre</Text>
            </Pressable>
            <Pressable onPress={onMenu} hitSlop={10} accessibilityRole="button" accessibilityLabel="Plus d'options">
              <Icon name="dots" size={15} color={colors.textMuted} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

function MenuItem({ icon, label, onPress, danger }: { icon: IconName; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem} accessibilityRole="button">
      <Icon name={icon} size={18} color={danger ? colors.terracottaText : colors.textPrimary} />
      <Text style={[styles.menuText, danger && { color: colors.terracottaText }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(237,227,212,.08)',
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  title: { fontFamily: typography.bodyBold, fontSize: 16, color: colors.textPrimary },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sortText: { fontFamily: typography.bodySemiBold, fontSize: 12.5, color: colors.textMuted },
  row: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  rowReply: { marginLeft: 46 },
  guestAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.12)',
  },
  fakeInput: { borderRadius: 20, backgroundColor: BUBBLE, paddingHorizontal: 14, paddingVertical: 11 },
  fakeInputText: { fontFamily: typography.body, fontSize: 14.5, color: colors.textMuted },
  composer: { flexDirection: 'row', alignItems: 'flex-end', borderRadius: 20, backgroundColor: BUBBLE, paddingLeft: 14, paddingRight: 6 },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 140,
    paddingTop: 10,
    paddingBottom: 10,
    fontFamily: typography.body,
    fontSize: 14.5,
    color: colors.textPrimary,
  },
  send: { width: 36, height: 40, alignItems: 'center', justifyContent: 'center' },
  cancel: { fontFamily: typography.bodySemiBold, fontSize: 12.5, color: colors.textMuted, marginTop: 5, marginLeft: 12 },
  locked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.3)',
    backgroundColor: 'rgba(240,195,107,.06)',
  },
  lockedText: { flex: 1, fontFamily: typography.bodySemiBold, fontSize: 13.5, color: colors.accentGoldPale },
  notice: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.accentGoldPale,
    backgroundColor: 'rgba(240,195,107,.10)',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  list: { marginTop: 4 },
  bubble: { backgroundColor: BUBBLE, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9, maxWidth: '100%' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontFamily: typography.bodyBold, fontSize: 13.5, color: colors.textPrimary, flexShrink: 1 },
  teamBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, backgroundColor: GOLD },
  teamText: { fontFamily: typography.bodyBold, fontSize: 9.5, color: colors.ctaTextOnGold, letterSpacing: 0.5 },
  text: { fontFamily: typography.body, fontSize: 14.5, lineHeight: 20, color: colors.textBody, marginTop: 2 },
  mention: { fontFamily: typography.bodyBold, color: GOLD },
  seeMore: { fontFamily: typography.bodyBold, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  deleted: { fontFamily: typography.body, fontSize: 13.5, color: colors.textMuted, fontStyle: 'italic' },
  likeBadge: {
    position: 'absolute',
    right: -6,
    bottom: -10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 2,
    paddingRight: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#1E1710',
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.12)',
  },
  likeBadgeIcon: {
    width: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GOLD,
  },
  likeBadgeText: { fontFamily: typography.bodySemiBold, fontSize: 12, color: colors.textBody },
  pending: { fontFamily: typography.body, fontSize: 12, color: colors.terracottaText, marginTop: 4, marginLeft: 4, fontStyle: 'italic' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 6, marginLeft: 12 },
  time: { fontFamily: typography.body, fontSize: 12, color: colors.textMuted },
  action: { fontFamily: typography.bodyBold, fontSize: 12.5, color: colors.textMuted },
  actionOn: { color: GOLD },
  repliesBlock: {},
  repliesToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 46, marginTop: -4, marginBottom: 10 },
  repliesLine: { width: 22, height: 1.5, backgroundColor: 'rgba(237,227,212,.2)' },
  repliesToggleText: { fontFamily: typography.bodyBold, fontSize: 13, color: colors.textMuted },
  more: { paddingVertical: 10 },
  moreText: { fontFamily: typography.bodyBold, fontSize: 13.5, color: GOLD },
  empty: { fontFamily: typography.body, fontSize: 13.5, color: colors.textMuted, marginTop: 4, marginBottom: 8 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,.55)', justifyContent: 'flex-end' },
  menu: {
    backgroundColor: '#15100B',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingVertical: 10,
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.2)',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 22, paddingVertical: 15 },
  menuText: { fontFamily: typography.bodySemiBold, fontSize: 15.5, color: colors.textPrimary },
});
