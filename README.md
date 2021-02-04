# Automated-Coffee-Chats

Background: Our team wanted a way to automatically set up coffee chats between team members. The process of manually matching people based on certain 
criteria became cumbersome especially as more team members were added and we started logging match histories to avoid repeats. It became impractical to continue
updating manually. Thus an effort to fully automate this process was started and this code base is the result of that initiative.

We utilized Google API's (Calendar, People, Admin Directory) in order to pull in organizational level details (e.g. job title, email addresses, office location)
to use as parameters for the pairing algorithm, and to automatically find availabilities on peoples' calendars - within the chosen time frame - and schedule 
meetings.

The pairing algorithm utilizes the Munkres module from (source: https://github.com/addaleax/munkres-js/blob/master/munkres.js) as an optimized method of 
assigning matches. The Munkres module requires a cost matrix as the input, and this cost matrix we generated by taking into account how long it has been
since two people have been matched. The goal of this methodology was to minimize the number of repeat assignments throughout the whole program. 

This program has been rolled out and running for 1.5 years now. Recent updates and refactoring have made the code simpler, automated more steps by employing more Google APIs,
and implementing the Munkres algorithm to optimize pair assignment.