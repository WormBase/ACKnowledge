![ACKnowledge logo](src/frontend/submission_form/public/lockup-with-rule-color-100.jpg)

The Author Curation to Knowledgebase project (ACKnowledge) aims at facilitating author curation to biological knowledgebases.</p>

Biological knowledgebases serve as a critical resource for researchers and accelerate scientific discoveries by providing manually curated, machine-readable data collections. At present, the aggregation and manual curation of biological data is a labor-intensive process that relies almost entirely on professional biocurators. Biocuration, however, is greatly aided when authors directly participate in the process.

ACKnowledge employs a semi-automated curation pipeline that identifies biological entities and data types (for example, genes and anatomic expression) from newly published research articles and then automatically emails authors to review the extracted information through a dedicated web interface. During the curation process, authors may modify extracted data, an important quality control measure. Participating authors are publicly acknowledged for their contribution in the knowledgebase.

The ACKnowledge system, currently implemented by WormBase for the <i>C. elegans</i> literature and soon to be implemented for other species, couples statistical methods and state-of-the-art text mining algorithms to identify entities and data types.</p>

Additional tools in the ACKnowledge system include software to send automated reminder emails to authors who have not completed their submissions, a notification system to inform knowledgebase curators about new author submissions, and a dashboard for curators to monitor submission status.</p>

The ACKnowledge project is supported by grant RO1 OD023041 from the National Library of Medicine at the US National Institutes of Health.</p>
If you have questions about the ACKnowledge project, please contact <a href="mailto:help.acknowledge@wormbase.org">help.acknowledge@wormbase.org</a>.</p>

[ACKnowledge Github repository](https://github.com/WormBase/ACKnowledge)

# Release Notes

## Version 5.0

### Release date
02-11-2025

## Introduction
ACKnowledge 5.0 is a landmark update that brings advanced functionality and significant improvements to our system. 
This release aligns our data access infrastructure with the Alliance of Genome Resources (Alliance) central repository. 
By leveraging the Alliance, we can now seamlessly fetch PDFs and related bibliographic data, ensuring our users have access to 
the most comprehensive and up-to-date resources.

ACKnowledge 5.0 also introduces an enhanced backend architecture capable of extracting entities for multiple organisms. 
This new modularity allows us to fetch entity lists directly from the Alliance, broadening our scope and making our 
platform more versatile for diverse research needs.

The release also brings new features, performance improvements, and crucial bug fixes, all designed to provide a more 
robust and efficient user experience.

### Main Updates
- Multiple authors can now submit data for the same paper. Each author is recognized as a contributor on the WormBase paper page
- The author curation interface now works even for authors behind stringent firewalls and proxies
- PDFs and related bibliographic data are now accessed from the Alliance of Genome Resources (AGR) central repository
- PDF to text conversion is now performed through GROBID, a machine learning library for converting structured PDFs into TEI, a standard XML format specifically designed for scientific articles
- Curators can now identify sentences of interest for curation in articles using machine learning models integrated into the curator dashboard
- Reminder emails are now sent every two weeks to increase the response rate
- ACKnowledge can now extract data for multiple organisms
- ACKnowledge is now integrated into Caltech AWS infrastructure, with improved security and performance
- ACKnowledge is now listed on the International Society for Biocuration (ISB) [curate page](https://www.biocuration.org/curate-now/)

### User Updates
- Non-curated transgenes are not automatically extracted from the text anymore
- Authors can now indicate if they contributed for the paper through other community curation initiatives
- Improved email exclusion list to consider preferences for receiving emails expressed by users on WormBase
- Removed images from all emails to improve accessibility and compatibility with email clients
- Added FAQ section for the 'new species' field

### Bug Fixes
- Fixed links to PubMed using the new URL format
- The author portal login is now case-insensitive
- Fixed various issues with the author curation form

### Curator Dashboard Updates
- Added a new page to view the sentences of interest identified by the machine learning models
- New button to download the sentences of interest in a CSV format

## Version 4.0

### Release date
10-27-2022

### Introduction
Release 4.0 marks an exciting transition for our project.  With support from the National Library of
Medicine, the Author First Pass (AFP) project is now officially known as ACKnowledge (Author Curation to Knowledgebase).
This change reflects our commitment to expanding artificial intelligence (AI)-enhanced community curation
to capture more detailed experimental findings and to introduce our curation pipeline to additional model
organism communities and their respective knowledgebases. While busy transitioning our project and enhancing
our AI methods, we also implemented further improvements to the current pipeline based on continuing
valuable feedback from authors. These improvements, listed below, will help authors add more information
about their papers and readily find previously published papers processed by our pipeline for curation using
our Author Curation Portal.

### Main Updates
- Renamed project to ACKnowledge (Author Curation to Knowledgebase)
- Updated user facing communications and forms
- Updated internal documentation
- Created an ACKnowledge logo
- Created an ‘About’ widget on the author curation form
- Provided project description
- Added NLM funding information
- Listed published references
- Created a project landing page: https://wormbase.github.io/ACKnowledge
- Fully transitioned from Support Vector Machines (SVM) to Neural Networks (NN) for datatype flagging

### User Updates
- Enabled access to author’s additional publications via the author curation portal (https://acp.acknowledge.textpressolab.com) from the author submission form and from all user-facing communications (emails)
- Added free text box for chemical- and environmental-induced phenotypes
- Added a free text box for adding new species not in the current auto-complete list
- Improved the comments section

### Bug Fixes
- Form now saves incremental updates to genes and species lists to database without requiring a full resubmission
- Proof papers are now excluded by the processing pipeline
- Improved authors’ email extraction
- Additional minor bug fixes

### Curator Dashboard Updates
- Improved statistics page to keep track of response rate on a yearly and monthly basis</li>
- Standardized representation of empty values in curator dashboard</li>

## Version 3.0

### Release Date
09-16-2021

### Introduction
Based on valuable user feedback, we continue to improve the ACKnowledge experience.  In addition to providing more 
streamlined ways to enter entities, we’ve added further instructions for adding new entities, and a link to look up 
specific entities in WormBase.  We now flag papers for enzymatic activity and include a free-text field to describe 
other gene functions.  We updated the FAQs and provide a link to the ACKnowledge webinar presented in February 2021. 
Lastly, to thank authors for their valuable contributions, we now acknowledge authors on WormBase person and paper pages.

We have implemented updates and improvements to our curator dashboard. The dashboard is a tool available to WormBase 
curators to  keep track of submissions and perform quality control of submitted data.

### Main Updates

#### User Updates
- Acknowledge author contributions on WormBase [Paper](https://wormbase.org/resources/paper/WBPaper00059759#0--10) and [Person](https://wormbase.org/resources/person/WBPerson625#014--10) pages
- Email all authors of a publication whenever possible
- Added linkout to WB pages for entities in select components
- Simplified add entities lists
- Improved instructions for Allele, Strain, and Transgene sections
- Added WormBase strain IDs
- Expanded exclusion lists (e.g. M9 buffer not recognized as strain)
- Included enzymatic activity neural network
- Added other gene function checkbox
- Created link to 'WormBase ACKnowledge Webinar' video
- Updated the FAQ section

#### Curator Dashboard Updates
- Created summary page with sortable lists of entities removed and added by authors
- Generated a pre-populated spreadsheet of all flagged data for each processed paper to allow authors an alternative data submission pipeline
- Updated dashboard thresholds with new [TFIDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf#:~:text=In%20information%20retrieval%2C%20tf%E2%80%93idf,in%20a%20collection%20or%20corpus.) values
- Sorted contributors by number of submissions
- Added download button for lists of papers

## Version 2.0

### Release Date
09-14-2020
           
### Introduction
We improved the ACKnowledge system based on feedback received from authors and statistics
collected during one year of ACKnowledge v1.0 author submissions. We improved the definition of
data types in the form and we refined our text mining algorithms to obtain better results.

### Main Updates
- Implemented [TFIDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf#:~:text=In%20information%20retrieval%2C%20tf%E2%80%93idf,in%20a%20collection%20or%20corpus.) in place of simple thresholds to improve precision of gene and allele recognition
- Improved datatype descriptions in "?" mouse-overs
- Added FAQs and Release Notes

## Version 1.0

### Release date
06-03-2019

### Introduction
We are proud to introduce our new ACKnowledge system, which leverages text mining to help authors curate
their papers and send data to WormBase! The system replaces the previous form which required authors
to submit data manually through free-text forms.</p>

### Main Updates
- Automated extraction of biological entities from articles based on text mining
- Extracted entities presented to author for validation through a newly designed web form
- Additional data types can be manually entered by authors
- Dashboard for curators to monitor submissions
- Monthly notifications to curators with newly submitted data
- Periodic email reminders to authors
- More details in [our paper](https://academic.oup.com/database/article/doi/10.1093/database/baaa006/5809234) published on Database

# References

[1] Arnaboldi V, Raciti D, Van Auken K, Chan JN, Muller H-M, Sternberg PW (2020) Text mining meets community curation: 
a newly designed curation platform to improve author experience and participation at WormBase. Database, 
doi:10.1093/database/baaa006
