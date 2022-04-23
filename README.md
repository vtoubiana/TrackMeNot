TrackMeNot
=================

This project is not currently being maintained. Code is made available for developers to fork. This is the FireFox vervsion of the project, for Chrome see https://github.com/vtoubiana/TrackMeNot-Chrome.


=== 

TrackMeNot is a lightweight browser extension that helps protect web searchers from surveillance and data-profiling by search engines. It does so not by means of concealment or encryption (i.e. covering one's tracks), but instead by the opposite strategy: noise and obfuscation. With TrackMeNot, actual web searches, lost in a cloud of false leads, are essentially hidden in plain view. User-installed TrackMeNot works with Firefox and Chrome browsers, integrates with all popular search engines, and requires no 3rd-party servers or services.

How It Works
TrackMeNot runs as a low-priority background process that periodically issues randomized search-queries to popular search engines, e.g., AOL, Yahoo!, Google, and Bing. It hides users' actual search trails in a cloud of 'ghost' queries, significantly increasing the difficulty of aggregating such data into accurate or identifying user profiles. TrackMeNot serves as a means of amplifying users' discontent with advertising networks that not only disregard privacy, but also facilitate the bulk surveillance agendas of corporate and government agencies, as documented recently in disclosures by Edward Snowden and others. To better simulate user behavior TrackMeNot uses a dynamic query mechanism to 'evolve' each client (uniquely) over time, parsing the results of its searches for 'logical' future query terms with which to replace those already used.


    TrackMeNot is user-installed and user-managed, residing wholly on users' system and functions without the need for 3rd-party servers or services. Placing users in full control is an essential feature of TrackMeNot, whose purpose is to protect against the unilateral policies set by search companies in their handling of our personal information. 


Why We Created TMN
The practice of logging user search activities and creating individual search profiles - sometimes identifiable - has received attention in mainstream press, e.g. the recent front-page New York Times article on AOL's release of collected data on individual searchers; also this front-page New York Times Business Section article describing the User-Profiling Practices of Yahoo!, AOL, Bing & Google.

We are disturbed by the idea that search inquiries are systematically monitored and stored by corporations like AOL, Yahoo!, Google, etc. and may even be available to third parties. Because the Web has grown into such a crucial repository of information and our search behaviors profoundly reflect who we are, what we care about, and how we live our lives, there is reason to feel they should be off-limits to arbitrary surveillance. But what can be done?

Legal approaches -- urging legislators to support limits on access, or courts to extend Fourth Amendment protection -- might be effective, but would require orchestrated efforts by many parties. Appeals to search companies themselves seem even less hopeful as their interests, at least on the surface, are in direct conflict with such limits. Both, at best, are long term prospects.

We have developed TrackMeNot as an immediate solution, implemented and controlled by users themselves. It fits within the class of strategies, described by Gary T. Marx, whereby individuals resist surveillance by taking advantage of blind spots inherent in large-scale systems1. TrackMeNot may not radically alter the privacy landscape but helps to place a particularly sensitive arena of contemporary life back in the hands of individuals, where it belongs in any free society.

Background
Public awareness of the vulnerability of searches to systematic surveillance and logging by search engine companies, was initially raised in the wake of a case, initiated August 2005, in which the United States Department of Justice (DOJ) issued a subpoena to Google for one week's worth of search query records (absent identifying information) and a random list of one million URLs from its Web index. This was cited as part of its defense of the constitutionality of the Child Online Protection Act (COPA). When Google refused, the DOJ filed a motion in a Federal District Court to force compliance. Google argued that the request imposed a burden, would compromise trade secrets, undermine customers' trust in Google, and have a chilling effect on search activities. In March 2006, the Court granted a reduced version of the first motion, ordering Google to provide a random listing of 50,000 URLs, but denied the second motion, namely, the request for search queries.

While viewed from the perspective of user privacy this seems a good outcome, yet it does bring to light several disquieting points. First, from court documents we learn that AOL, Yahoo!, and Microsoft have complied with the government's request, though details are not given. Second, we must face the reality that logs of our online searches are in the hands of search companies and can be quite easily linked to our identities. Thirdly, it is clear we have little idea of, or say in, what can be done with these logs. While, in this instance, Google withheld such records from the Government, it would be foolish to count on this outcome in the future.

TrackMeNot is a work in progress -- we welcome feedback from the community!
  	
Daniel C. Howe
School of Creative Media, HK
https://rednoise.org/daniel
email: daniel<at>rednoise.org 	  	
Helen Nissenbaum
Media, Culture & Communication / CS
http://www.nyu.edu/projects/nissenbaum
email: hfn1<at>nyu.edu
  	
Vincent Toubiana
http://unsearcher.org
email: v.toubiana<at>free.fr 	 	
	
 
Special thanks to the NYU Dept of Computer Science, the Media Research Lab, the Mozilla Foundation, Missing Pixel, the Portia Project, Babelzilla, Ernest Davis, Michael Zimmer, John Fanning, and Robb Bifano.
