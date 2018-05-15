import codecs
import re
import csv
import datetime


def getTrackMeNot():
	'''
	Crawl through the TrackMeNotLogs.csv - file containing all of the 
	downloaded trackMeNot logs along with the times at which they were made
	Create the dict trackMeNotDict w/ following structure
		key: trackMeNotQuery (string)
		value: array of times at which that trackMeNoT query was made (array of strings)
	'''

	with open('TrackMeNotLogs.csv','r') as f:
		reader = csv.reader(f)
		trackMeNotDict = {}
		for log in reader:
			date_time = log[0]
			engine = log[1]
			query = log[4]	
			if engine == 'google':
				if query not in trackMeNotDict:
					trackMeNotDict[query] = [date_time]
				else:
					trackMeNotDict[query] = trackMeNotDict[query] + [date_time]
	return trackMeNotDict


def parseGoogleTime(googleTime):
	'''
	parses googleTime into a dict so that it can be easily
	made into a datetime.datetime object
	example:
	input googleTime: 'May 13, 2018, 2:48:56 PM'
	'''
	googleTimeParsed = {}

	month_format = re.compile(r'(?P<month>Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)')
	month_str = month_format.search(googleTime).group(0)
	months_array = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
	month_int = months_array.index(month_str)
	googleTimeParsed['month'] = month_int

	day_format = re.compile(r'(?P<day>[123]?[0-9][,])')
	day_str  = day_format.search(googleTime).group(0)
	day_int = int(day_str[0:len(day_str)-1])
	googleTimeParsed['day'] = day_int

	year_format = re.compile(r'(?P<year>201[78])')
	year = int(year_format.search(googleTime).group(0))
	googleTimeParsed['year'] = year

	time_format = re.compile(r'(?P<hour>[1]?[0-9])'
								r'(:)'
								r'(?P<min>[0-9][0-9])'
								r'(:)'
								r'(?P<sec>[0-9][0-9])'
								)
	time = time_format.search(googleTime).group(0)
	first_colon = time.find(':')
	second_colon = time.find(':', first_colon+1)

	hour = int(time[0:first_colon])
	minute = int(time[first_colon+1:second_colon])
	second = int(time[second_colon+1:])

	
	googleTimeParsed['minute'] = minute
	googleTimeParsed['second'] = second

	am_pm_format = re.compile(r'(?P<AM_PM>PM)')
	am_pm = am_pm_format.search(googleTime).group(0)
	if hour == 12:
		if am_pm == "AM":
			hour = 0
	else:
		if am_pm == "PM":
			hour = hour +12

	googleTimeParsed['hour'] = hour

	return googleTimeParsed

def parseTrackMeNotTime(trackMeNotTimes):
	'''
	parses each of the times in trackMeNotTimes 
	into a dict so that it can be easily made into a 
	datetime.datetime object
	example trackMeNotTimes ['22:54:53   5/13/2018', '22:20:19   5/13/2018', '21:55:32   5/13/2018', '21:42:27   5/13/2018']
	'''
	arrayOfParsedDict = []
	for entry in trackMeNotTimes:
		parsed_dict = {}
		print (entry)
		time_format = re.compile(r'(?P<hour>[12]?[0-9])'
								r'(:)'
								r'(?P<min>[0-9][0-9])'
								r'(:)'
								r'(?P<sec>[0-9][0-9])'
								)
		time = time_format.search(entry).group(0)
		first_colon = time.find(':')
		second_colon = time.find(':',first_colon+1)
		print (time)
		hour = int(time[0:first_colon])
		
		minute = int(time[first_colon+1:second_colon])
		second = int(time[second_colon+1:])

		parsed_dict['hour'] = hour
		parsed_dict['minute'] = minute
		parsed_dict['second'] = second

		date_format = re.compile(r'(?P<month>[1]?[0-9])'
								r'(/)'
								r'(?P<day>[0-9]?[0-9])'
								r'(/)'
								r'(?P<year>201[78])'
								)
		date = date_format.search(entry).group(0)
		first_slash = date.find('/')
		second_slash = date.find('/',first_slash+1)

		month = int(date[0:first_slash])
		day = int(date[first_slash+1:second_slash])
		year = int(date[second_slash+1:])

		parsed_dict['month'] = month
		parsed_dict['day'] = day
		parsed_dict['year'] = year

		arrayOfParsedDict.append(parsed_dict)
	return arrayOfParsedDict


def compareQueryTimes(googleTime, trackMeNotTimes):
	'''
	Check that the time described by googleTime is within 10 seconds of
	one of the times in the trackMeNotTimes array
	'''
	googleParsed = parseGoogleTime(googleTime)
	trackMeParsedTimeArray = parseTrackMeNotTime(trackMeNotTimes)
	googleDateTime = datetime.datetime(googleParsed['year'],googleParsed['month'],googleParsed['day'],googleParsed['hour'],googleParsed['minute'],googleParsed['second'])
	# with open('Testing.csv', 'a') as csvfile:
	# 	fieldnames = ['GoogleTime', 'TrackMeNotTimes']
	# 	writer = csv.DictWriter(csvfile, fieldnames = fieldnames)
	# 	writer.writerow({'GoogleTime':googleTime,'TrackMeNotTimes':trackMeNotTimes})
	#print (trackMeParsedTimeArray)

	for trackMeEntry in trackMeParsedTimeArray:
		trackMeDateTime = datetime.datetime(trackMeEntry['year'],trackMeEntry['month'],trackMeEntry['day'],trackMeEntry['hour'],trackMeEntry['minute'],trackMeEntry['second'])
		diffTimeDelta = abs(trackMeDateTime - googleDateTime) 
		if diffTimeDelta.seconds <= 10:
			return True
	return False

		


	#return True
	#check that the googleTime is close enough to at least one of the trackMeNotTimes


def checkTrackMeNotQuery(googleQuery, googleQueryTime, trackMeNotDict):
	'''
	Determines if a given google search query was made by TrackMeNot
	Does this by checking the googleQuery and the googleQueryTime against 
	the TrackMeNotDict {trackMeNotQuery: [array of times at which trackMeNoT query was made]}
	'''
	if googleQuery not in trackMeNotDict:
		return "No"
	else:
		trackMeNotTimes = trackMeNotDict[googleQuery] #this is an array 
		timesMatch = compareQueryTimes(googleQueryTime, trackMeNotTimes)
		if timesMatch is True:
			#print ("WE GOT A YES")
			return "Yes"
		else:
			#print ("WE GOT A NO")
			return "No"


def createGoogleSearchFile(trackMeNotDict):
	'''
	parameters:
		trackMeNotDict: see getTrackMeNotDict()
	This function parses MyActivity.html
	Specifically, it retrieves all Google Searches and excludes everything else
	It places all google searches in the GoogleSearchResults.csv file
	The GoogleSearchResults.csv file has 3 columns:
	(query, time, TrackMeNot)
	The TrackMeNot column is a "Yes" if the query was made by TrackMeNot. o.w. it is a "No"
	Note: MyActivity.html file contains the user's entire search history
	It includes the searches made by TrackmMNot
	'''
	f=codecs.open("MyActivity.html", 'r')

	try: 
	    from BeautifulSoup import BeautifulSoup
	except ImportError:
	    from bs4 import BeautifulSoup
	href = re.compile('https://www.google.com/search\?q=[a-zA-Z0-9]*')
	html = f.read() #the HTML code you've written above
	parsed_html = BeautifulSoup(html, "lxml")
	x = '[1]';
	y = '[3]';
	time_format = re.compile(
				r'(?P<month>May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)' 
				r'([ ])'
				r'(?P<day>[1][3])'#[1][3])' #    [123]?[0-9])'
				r'(,)'
				r'([ ])'
				r'(?P<year>201[78])'
				r'(,)'
				r'([ ])'
				r'(?P<hour>[1]?[0-9])'
				r'(:)'
				r'(?P<min>[0-9][0-9])'
				r'(:)'
				r'(?P<sec>[0-9][0-9])'
				r'([ ])'
				r'(?P<AM_PM>PM)' #   AM|PM)'
				)
	with open('GoogleSearchResults.csv', 'w') as csvfile:
		fieldnames = ['Time', 'Query', 'TrackMeNot']
		writer = csv.DictWriter(csvfile, fieldnames = fieldnames)
		writer.writeheader()
		for wrapper in (parsed_html.body.find_all('div', attrs={'class':'content-cell mdl-cell mdl-cell--6-col mdl-typography--body-1'})):
			time_tag_match = time_format.search(wrapper.text)
			if time_tag_match is not None:
				time_tag_str = time_tag_match.group(0)
				time_index = wrapper.text.find(time_tag_str)
				search_for_index = len('Searched for')
				search_text = wrapper.text[search_for_index+1:time_index]
				time_text = wrapper.text[time_index:]
				trackMeNot = checkTrackMeNotQuery(search_text, time_text, trackMeNotDict)
				writer.writerow({'Time':time_text,'Query':search_text, 'TrackMeNot': trackMeNot})
				#print (search_text, time_text)

def analyzeGoogleSearches():
	log_dict = {}
	with open('GoogleSearchResults.csv', 'r') as f:
		reader = csv.reader(f)
		for log in reader:
			query = log[1]
			if query in log_dict:
				log_dict[query] = log_dict[query] + 1
			else:
				log_dict[query] = 1
	amount_correct = 0
	amount_wrong  =0
	with open('GoogleSearchResults.csv', 'r') as f:
		reader = csv.reader(f)
		for log in reader:
			query = log[1]
			yes_no = log[2]
			if log_dict[query] > 1:
				guess = "Yes"
			else:
				guess = "No"
			if yes_no == guess:
				amount_correct +=1
			else:
				amount_wrong +=1
	print ('amount_correct', amount_correct)
	print ('amount_wrong', amount_wrong)
	
def main():
	# with open('Testing.csv', 'w') as csvfile:
	# 	fieldnames = ['GoogleTime', 'TrackMeNotTimes']
	# 	writer = csv.DictWriter(csvfile, fieldnames = fieldnames)
	# 	writer.writeheader()
	
	#trackMeNotDict = getTrackMeNot()
	
	#print (trackMeNotDict)
	# month = ['May']
	# day = [13, 14]
	# year = [2018]
	#createGoogleSearchFile(trackMeNotDict)
	analyzeGoogleSearches()


if __name__ == "__main__":
	main()


		