# WormBase ACKnowledge

ACKnowledge (previously known as "Author First Pass") is a semi-automated curation tool that periodically extracts biological entities from newly published research 
articles on *C. elegans* and emails out authors, who can review and modify/confirm the extracted 
information and submit curated data to WormBase through a dedicated web interface.

Additional tools in the ACKnowledge system include software to send automated reminder emails to authors who have not completed 
their submissions, a notification system to inform curators at WormBase about new author submissions related to their 
data type of interest, and a dashboard for curators to monitor submissions and to 'diff' extracted vs. submitted 
data.

# Release Notes

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

### Main Features

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

### Main Features
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

### Main Features
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
