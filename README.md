FROM ORAL TRADITION TO DIGITAL INNOVATION: DESIGN OF AFROBACK, A SECURE MOBILE PLATFORM FOR THE PRESERVATION AND TRANSMISSION OF AFRICAN CULTURAL HERITAGE INTEGRATING DATA ENCRYPTION, AUTHENTICATION, ACCESS CONTROL AND DATA INTEGRITY
AFROBACK
Problem Statement
A large part of African oral heritage remains undocumented and is disappearing with its holders. The digital initiatives that do exist are scattered, are rarely designed for African communities and their languages, and seldom treat security as a first-class requirement. As a result, digitised cultural content is exposed to several concrete threats:
•	Tampering and falsification: a narrative can be modified, or replaced by an altered version, without anyone being able to detect it.
•	Unauthorised access: knowledge that a community considers private, sacred or reserved to initiated members can be viewed by anyone.
•	Account compromise: weak authentication allows attackers to take over contributor or administrator accounts, and through them the content.
•	Loss of attribution and misappropriation: content and images are copied and reused outside the platform without reference to their source or custodians.
•	Disclosure of sensitive data: personal data of users, including children and parents, can leak if it is not protected in transit and at rest.

These threats undermine the very purpose of a heritage platform, because a heritage that cannot be trusted is not preserved. This study is therefore guided by the following central question:
How can cybersecurity mechanisms (data encryption, authentication, access control and data integrity) be integrated into a mobile platform to ensure the secure preservation, authenticity and controlled transmission of African cultural heritage?
 Objectives
 General Objective
The general objective of this project is to design and implement AFROBACK, a secure mobile platform for the preservation and transmission of African cultural heritage, integrating data encryption, authentication, access control and data integrity mechanisms.
 Specific Objectives
To achieve this general objective, the project pursues the following specific objectives:
1.	To analyse the needs and expectations of potential users regarding the digital preservation of cultural heritage, through a questionnaire survey.
2.	To design the architecture of a mobile platform and its administration back-office that supports textual, audio, video and image heritage content.
3.	To implement a strong authentication mechanism, including password hashing, two-factor authentication (TOTP) and protection against brute-force attacks.
4.	To implement role-based access control so that every actor can only access and modify the data corresponding to their role.
5.	To guarantee the integrity and authenticity of heritage content using SHA-256 fingerprints, HMAC signatures and an append-only integrity log.
6.	To protect sensitive data through encryption in transit and at rest.
7.	To test and evaluate the functional behaviour and the security of the platform.

1.4 Research Questions
Because this project is a design and implementation study rather than an experimental one, it is guided by research questions instead of statistical hypotheses. The following questions derive from the problem statement:
1.	RQ1: How do young Africans, on the continent and in the diaspora, currently access their cultural heritage, and do they perceive it as being at risk?
2.	RQ2: What features and guarantees do potential users expect from a digital heritage platform?
3.	RQ3: Which authentication, access control, integrity and encryption mechanisms are appropriate to protect heritage content and user accounts on a mobile platform, given the constraints of a student project with a limited budget?
4.	RQ4: To what extent does the implemented platform satisfy these security requirements, and what are its residual limitations?

 Scope of the Research
The project covers the following perimeter:
•	Geographical and cultural scope: the content focuses mainly on Cameroon (Bamileke, Beti/Bulu, Bassa, Sawa, Bamoun and other cultures), with a few pan-African heroes (from Angola, Congo and Ghana). The survey targeted Cameroonians and people of African origin living on the continent and in the diaspora.
•	Functional scope: heroes' stories (text, audio narration and video), myths, cultural Discovery sheets, illustrated storyboards, a learning space for children with parental control, a community space, and an administration back-office.
•	Security scope: the four pillars of the title (authentication, access control, data integrity and data encryption), plus security logging.
•	Out of scope: real payment processing, the publication of the application on the Google Play and Apple App Stores, and a full external penetration test, which are planned as future work.

 Significance of the Study
This study is significant at several levels:
•	For communities and custodians, it offers a tool to record their knowledge and to keep control over its integrity and circulation.
•	For young people and the diaspora, it offers access to their heritage on the device they already use every day, in an attractive format (narration, video, storyboards, quizzes).
•	For cultural institutions and schools, it provides a reliable source whose content can be verified, in response to the low trust in online cultural content revealed by our survey.
•	For the field of cybersecurity, it shows how standard security mechanisms (TOTP, RBAC with Row Level Security, SHA-256, HMAC, encryption) can be combined and adapted to the specific context of cultural heritage, and documents honestly the limits of each choice.
•	For the student, it constitutes a complete practical application of the knowledge acquired in the Bachelor programme in cybersecurity at The ICT University.

 Limitations of the Study
Several limitations must be acknowledged from the outset:
•	Sample: the survey reached 226 respondents, mostly aged 25 or under (50%). Elders and traditional custodians, who are key stakeholders, are under-represented.
•	Budget: the project relies on the free tier of the Supabase cloud platform. Some protections (for example server-side authentication hooks or SMS one-time passwords) were deliberately excluded because of their recurring cost.
•	Time: a full public key infrastructure for asymmetric digital signatures and an external penetration test could not be completed within the academic calendar.
•	Content validation: the accuracy of cultural content, and of translations into local languages such as Ewondo, must ultimately be validated by native speakers and community custodians.


About the Project

AFROBACK is a secure mobile platform designed to preserve, document, and transmit African cultural heritage through digital technology. The project aims to help protect traditional knowledge, oral traditions, stories, and cultural practices  while making them accessible to future generations.

The platform integrates cybersecurity mechanisms to protect cultural information against unauthorized access, modification, and loss.



Cybersecurity Features

* Data Encryption: Protect sensitive cultural information from unauthorized disclosure.
* Authentication: Verify the identity of users accessing the platform.
* Access Control: Restrict access to information according to user permissions.
* Data Integrity: Help ensure that stored cultural information remains accurate and unaltered without authorization.

Project Goals

AFROBACK seeks to bridge the gap between African oral traditions and modern digital technologies by combining cultural preservation, accessibility, and cybersecurity.

Project Status

Currently under development as part of a final-year academic project in Cybersecurity.

Author

Developed as an academic project focused on cybersecurity, cultural heritage preservation, and digital innovation.
