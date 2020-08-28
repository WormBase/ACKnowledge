# WormBase Author First Pass system (AFP)

AFP is a semi-automated curation tool that periodically extracts biological entities from newly published research 
articles on *C. elegans* and emails out corresponding authors, who can review and modify/confirm the extracted 
information and submit curated data to WormBase through a dedicated web interface.

Additional tools in the AFP system include software to send automated reminder emails to authors who have not completed 
their submissions, a notification system to inform curators at WormBase about new author submissions related to their 
data type of interest, and a dashboard for curators to monitor AFP submissions and to 'diff' extracted vs. submitted 
data.

# Release Notes

## Version 1.0

### Release Date
06-03-2019

### Main Features:
- Automated extraction of biological entities from articles based on text mining
- Extracted entities presented to author for validation through a newly designed web application
- Additional data types can be manually entered by authors
- Dashboard for curators to monitor submissions
- Monthly notifications to curators with newly submitted data
- Periodic email reminders to authors
- More details in our paper published on Database: https://academic.oup.com/database/article/doi/10.1093/database/baaa006/5809234

# References

[1] Arnaboldi V, Raciti D, Van Auken K, Chan JN, Muller H-M, Sternberg PW (2020) Text mining meets community curation: 
a newly designed curation platform to improve author experience and participation at WormBase. Database, 
doi:10.1093/database/baaa006
