import codecs
import re
import csv
import datetime


def getTrackMeNot():
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
	googleTimeParsed = {}

	month_format = re.compile(r'(?P<month>Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)')
	month = month_format.search(googleTime).group(0)
	googleTimeParsed[month] = month

	day_format = re.compile(r'(?P<day>[123]?[0-9][,])')
	day  = day_format.search(googleTime).group(0)[1:]
	googleTimeParsed[day] = day

	year_format = re.compile(r'(?P<year>201[78])')
	year = year_format.search(googleTime).group(0)
	googleTimeParsed[year] = year

	time_format = re.compile(r'(?P<hour>[1]?[0-9])'
								r'(:)'
								r'(?P<min>[0-9][0-9])'
								r'(:)'
								r'(?P<sec>[0-9][0-9])'
								)
	time = time_format.search(googleTime).group(0)
	first_colon = time.find(':')
	second_colon = time[first_comma+1:].find(':')

	hour = time[0:first_colon]
	minute = time[first_colon+1:second_colon]
	second = time[second_colon+1:]

	
	googleTimeParsed[minute] = minute
	googleTimeParsed[second] = second

	am_pm_format = re.compile(r'(?P<AM_PM>PM)')
	am_pm = am_pm_format.search(googleTime).group(0)
	if hour == 12:
		if am_pm == "AM":
			hour = 0
	else:
		if am_pm == "PM":
			hour = hour +12

	googleTimeParsed[hour] = hour

	return googleTimeParsed

def trackMeNotTimeParsed(trackMeNotTimes):
	arrayOfParsedDict = []
	for entry in trackMeNotTimes:
		parsed_dict = {}
		time_format = re.compile(r'(?P<hour>[1]?[0-9])'
								r'(:)'
								r'(?P<min>[0-9][0-9])'
								r'(:)'
								r'(?P<sec>[0-9][0-9])'
								)
		time = time_format.search(entry).group(0)
		first_colon = time.find(':')
		second_colon = time[first_comma+1:].find(':')

		hour = time[0:first_colon]
		minute = time[first_colon+1:second_colon]
		second = time[second_colon+1:]

		parsed_dict[hour] = hour
		parsed_dict[minute] = minute
		parsed_dict[second] = second

		date_format = re.copmile(r'(?P<month>[1]?[0-9])'
								r'(/)'
								r'(?P<day>[0-9]?[0-9])'
								r'(/)'
								r'(?P<year>201[78])'
								)
		date = date_format.search(entry).group(0)
		first_slash = date.find('/')
		second_slash = date[first_slash+1:].find('/')

		month = date[0:first_slash]
		day = date[first_slash+1:second_slash]
		year = date[second_slash+1:]

		parsed_dict[month] = month
		parsed_dict[day] = day
		parsed_dict[year] = year

		arrayOfParsedDict.append(parsed_dict)


def compareQueryTimes(googleTime, trackMeNotTimes):
	'''Check that the google search time is within 10 seconds of
	one of the matched trackMeNot times'''
	googleParsed = parseGoogleTime(googleTime)
	trackMeParsedTimeArray = parseTrackMeNotTime(trackMeNotTimes)
	googleDateTime = datetime.datetime(googleParsed.year,googleParsed.month,googleParsed.day,googleParsed.hour,googleParsed.minute,googleParsed.second)
	for trackMeEntry in trackMeParsedTimeArray:
		trackMeDateTime = datetime.datetime(trackMeEntry.year,trackMeEntry.month,trackMeEntry.day,trackMeEntry.hour,trackMeEntry.minute,trackMeEntry.second)
		if abs(trackMeDateTime - googleDateTime) <= 10:
			return True
	return False


	

	with open('Testing.csv', 'a') as csvfile:
		fieldnames = ['GoogleTime', 'TrackMeNotTimes']
		writer = csv.DictWriter(csvfile, fieldnames = fieldnames)
		writer.writerow({'GoogleTime':googleTime,'TrackMeNotTimes':trackMeNotTimes})


	return True
	#check that the googleTime is close enough to at least one of the trackMeNotTimes


def checkTrackMeNotQuery(googleQuery, googleTime, trackMeNotDict):
	if googleQuery not in trackMeNotDict:
		return "No"
	else:
		print ("ITS IN")
		trackMeNotTimes = trackMeNotDict[googleQuery] #this is an array 
		timesMatch = compareQueryTimes(googleTime, trackMeNotTimes)
		if timesMatch is True:
			return "Yes"
		else:
			return "No"

	if "palm" in trackMeNotDict:
		print ("HELLO WORLD")

def getGoogleActivity(trackMeNotDict):
	'''
	MyActivity.html file contains the user's entire search history
	It includes the searches made by TrackmMNot
	This function parses MyActivity.html
	Specifically, it retrieves all Google Searches and excludes everything else

	'''
	f=codecs.open("MyActivity.html", 'r')
	#print f.read()

	try: 
	    from BeautifulSoup import BeautifulSoup
	except ImportError:
	    from bs4 import BeautifulSoup
	href = re.compile('https://www.google.com/search\?q=[a-zA-Z0-9]*')
	html = f.read() #the HTML code you've written above
	parsed_html = BeautifulSoup(html, "lxml")
	time_format = re.compile(
				r'(?P<month>May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)' 
				r'([ ])'
				r'(?P<day>[1][3])' #    [123]?[0-9])'
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

			

def main():
	with open('Testing.csv', 'w') as csvfile:
		fieldnames = ['GoogleTime', 'TrackMeNotTimes']
		writer = csv.DictWriter(csvfile, fieldnames = fieldnames)
		writer.writeheader()
	trackMeNotDict = getTrackMeNot()
	getGoogleActivity(trackMeNotDict)


if __name__ == "__main__":
	main()


		