# WormBase Author First Pass system (AFP)

AFP is a semi-automated curation tool that periodically extracts biological entities from newly published research 
articles on *C. elegans* and emails out corresponding authors, who can review and modify/confirm the extracted 
information and submit curated data to WormBase through a dedicated web interface.

Additional tools in the AFP system include software to send automated reminder emails to authors who have not completed 
their submissions, a notification system to inform curators at WormBase about new author submissions related to their 
data type of interest, and a dashboard for curators to monitor AFP submissions and to 'diff' extracted vs. submitted 
data.

# Release Notes

## Version 2.0

### Release Date
09-14-2020
           
### Introduction
We improved the AFP system based on feedback received from authors and statistics
collected during one year of AFP v1.0 author submissions. We improved the definition of
data types in the form and we refined our text mining algorithms to obtain better results.

### Main Features
- Implemented [TFIDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf#:~:text=In%20information%20retrieval%2C%20tf%E2%80%93idf,in%20a%20collection%20or%20corpus.) in place of simple thresholds to improve precision of gene and allele recognition
- Improved datatype descriptions in "?" mouse-overs
- Added FAQs and Release Notes

## Version 1.0

### Release date
06-03-2019

### Introduction
We are proud to introduce our new AFP system, which leverages text mining to help authors curate
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
