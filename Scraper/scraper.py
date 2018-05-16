import codecs
import re
import csv
import datetime
import pandas as pd
import subprocess


def getTrackMeNotDict(trackMeNotLogFile):
	'''
	Input: string (filename)
	Returns: dict

	Crawl through the TrackMeNotLogs.csv - file containing all of the 
	downloaded trackMeNot logs along with the times at which they were made
	Create the dict trackMeNotDict w/ following structure
		key: trackMeNotQuery (string)
		value: array of times at which that trackMeNoT query was made (array of strings)
	'''
	with open(trackMeNotLogFile,'r') as f:
		reader = csv.reader(f)
		trackMeNotDict = {}
		for log in reader:
			date_time = log[0]
			engine = log[1]
			query = log[4]	
			if engine == 'google' and not query.isspace() and not date_time.isspace():
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
		input googleTime= 'May 13, 2018, 2:48:56 PM'
		output: datetime.datetime(5, 13, 2018, 14, 48, 56)
			Note the format: datetime.datetime(month, day, year, hour, minute, second)
	'''
	googleTimeParsed = {}

	month_format = re.compile(r'(?P<month>Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)')
	month_str = month_format.search(googleTime).group(0)
	months_array = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
	month_int = months_array.index(month_str) + 1
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
	googleDateTime = datetime.datetime(googleTimeParsed['year'],googleTimeParsed['month'],googleTimeParsed['day'],googleTimeParsed['hour'],googleTimeParsed['minute'],googleTimeParsed['second'])
	return googleDateTime

def parseTrackMeNotTime(trackMeNotTimes):
	'''
	Input: array of times (array of strings)
	Output: datetime.datetime object

	parses each of the times in trackMeNotTimes 
	into a dict so that it can be easily made into a 
	datetime.datetime object

	example:
		input: trackMeNotTimes ['22:54:53   5/13/2018', '22:20:19   5/13/2018', '21:55:32   5/13/2018', '21:42:27   5/13/2018']
		output: datetime.datetime[(5, 13, 2018, 24, 54, 53), ... ]
			Note the format: datetime.datetime(month, day, year, hour, minute, second)
	'''
	arrayOfParsedDict = []
	for entry in trackMeNotTimes:
		parsed_dict = {}
		time_format = re.compile(r'(?P<hour>[12]?[0-9])'
								r'(:)'
								r'(?P<min>[0-9][0-9])'
								r'(:)'
								r'(?P<sec>[0-9][0-9])'
								)
		time = time_format.search(entry).group(0)
		first_colon = time.find(':')
		second_colon = time.find(':',first_colon+1)
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
	trackMeDateTimeArray = []
	for trackMeEntry in arrayOfParsedDict:
		trackMeDateTime = datetime.datetime(trackMeEntry['year'],trackMeEntry['month'],trackMeEntry['day'],trackMeEntry['hour'],trackMeEntry['minute'],trackMeEntry['second'])
		trackMeDateTimeArray.append(trackMeDateTime)
	return trackMeDateTimeArray

def compareQueryTimes(googleTime, trackMeNotTimes):
	'''
	Check that the time described by googleTime is within 10 seconds of
	one of the times in the trackMeNotTimes array
	'''
	googleDateTime = parseGoogleTime(googleTime)
	trackMeParsedTimeArray = parseTrackMeNotTime(trackMeNotTimes)
	#googleDateTime = datetime.datetime(googleParsed['year'],googleParsed['month'],googleParsed['day'],googleParsed['hour'],googleParsed['minute'],googleParsed['second'])
	for trackMeDateTime in trackMeParsedTimeArray:
		diffTimeDelta = abs(trackMeDateTime - googleDateTime) 
		if diffTimeDelta.seconds <= 10:
			return True
	return False

def checkTrackMeNotQuery(googleQuery, googleQueryTime, trackMeNotDict):
	'''
	Determines if a given google search query was made by TrackMeNot
	Does this by checking the tuple (googleQuery, googleQueryTime) against 
	the TrackMeNotDict {trackMeNotQuery: [array of times at which trackMeNoT query was made]}
	'''
	if googleQuery not in trackMeNotDict:
		return "No"
	else:
		trackMeNotTimes = trackMeNotDict[googleQuery] #this is an array 
		timesMatch = compareQueryTimes(googleQueryTime, trackMeNotTimes)
		if timesMatch is True:
			return "Yes"
		else:
			return "Yes"


def createGoogleSearchFile(googleActivityFile, googleLogFile, trackMeNotDict):
	'''
	parameters:
		googleActivityFile: search downloaded from Google My Activity 
		googleLogFile: filename of file to create for logs of google searches
		trackMeNotDict: see getTrackMeNotDict()
	This function parses MyActivity.html
	Specifically, it retrieves all Google Searches and excludes everything else 
	(i.e. this excludes a visit to a website such as facebook.com or yankees.com)
	It places all google searches in the GoogleSearchResults.csv file
	After this function runs, the GoogleSearchResults.csv file has 2 columns:
	(query, time). Note that GoogleSearchResults.csv will have a 3rd column after 
	addTrackMeNotColumn() is run
	
	Note: MyActivity.html file contains the user's entire browsing history
	Thus MyActivity.html includes the searches made by TrackMeNot as well as searches
	that the user actually made
	'''
	f=codecs.open(googleActivityFile, 'r')

	try: 
	    from BeautifulSoup import BeautifulSoup
	except ImportError:
	    from bs4 import BeautifulSoup
	href = re.compile('https://www.google.com/search\?q=[a-zA-Z0-9]*')
	html = f.read() #the HTML code you've written above
	parsed_html = BeautifulSoup(html, "lxml")
	time_format = re.compile(
				r'(?P<month>Jun|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)' 
				r'([ ])'
				r'(?P<day>[1-3]?[0-9])'#[1][3])' #    
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
	with open(googleLogFile, 'w') as csvfile:
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
				writer.writerow({'Time':time_text,'Query':search_text})

	
def addTrackMeNotColumn(googleLogFile, trackMeNotDict):
	'''
	add a TrackMeNotColumn to googleLogFile using the trackMeNotDict
	The TrackMeNot column is a "Yes" if the query was made by TrackMeNot. o.w. it is a "No"
	'''
	with open(googleLogFile,'r') as csvfile:
		##DON"T READ THE DAMN HEADER
		reader = csv.reader(csvfile)
		next(reader) #skip the header
		trackMeNotColumn = []
		for record in reader:
			query_time = record[0]
			query_text = record[1]
			trackMeNot = checkTrackMeNotQuery(query_text, query_time, trackMeNotDict)
			trackMeNotColumn.append(trackMeNot)
	df = pd.read_csv(googleLogFile)
	df['TrackMeNot'] = trackMeNotColumn
	df.to_csv(googleLogFile, index=False)

def getLatestTrackMeNotTime(trackMeNotLogFile):
	'''
	Input: trackMeNotLogFile (string) is csv file name of file with trackMeNot logs
	Output: datetime.datetime object of the earliest trackMeNot query in trackMeNotLogFile
	'''
	last_time = subprocess.check_output(["tail", "-1", trackMeNotLogFile]).decode("utf-8") 
	last_time = last_time[0:last_time.find(',')]
	last_time_parsed = parseTrackMeNotTime([last_time])[0]
	print (last_time_parsed)
	return last_time_parsed



def determineGoogleLogCutoff(googleLogFile, trackMeNotLogFile):
	'''
	Returns the index of log in googleLogFile that was made at time t
	where time t is the time of the earliest log in the TrackMeNotLogFile
	'''
	latestTrackMeNotDateTime = getLatestTrackMeNotTime(trackMeNotLogFile)
	cutoffIndex = 0
	with open(googleLogFile, 'r') as csvfile:
		reader = csv.reader(csvfile)
		next(reader) #SKIP THE HEADER
		
		for log in reader:
			query_time = log[0]
			googleDateTime = parseGoogleTime(query_time)
			diff  = googleDateTime - latestTrackMeNotDateTime
			if diff.days >= 0:
				cutoffIndex +=1
			else:
				break
				
	return cutoffIndex


def analyzeByQueryFrequency(googleLogFile, trackMeNotLogFile, cutOffIndex):
	'''
	parameters:
		googleLogFile (string) is csv file name of file with google logs
		trackMeNotLogFile (string) is csv file name of file with trackMeNot logs
	Objective:
		Determine (guess) which Google search queries were made by TrackMeNot 
		and determine which Google search queries were authentic
	Method:
		For each google search, check if it was made more than once
		if so, guess that it was
		First, create log_dict
			key: query
			value: amount of times that query was made
		Then, traverse the dict and assign guesses according to protocol described above

	Note: This function only runs on logs that were made after time t where
	time t is the time of the first TrackMeNot log we have record of
	'''
	logFrequencyDict = {}
	#create log_dict
	latestTrackMeNotDateTime = getLatestTrackMeNotTime(trackMeNotLogFile) #return datetime.datetime object
	with open(googleLogFile, 'r') as csvfile:
		reader = csv.reader(csvfile)
		next(reader) #SKIP THE HEADER
		#cutoffIndex = 0
		for log in reader:
			#cutoffIndex +=1
			query_text = log[1]
			query_time = log[0]
			googleDateTime = parseGoogleTime(query_time)
			diff  = googleDateTime - latestTrackMeNotDateTime
			if diff.days >= 0:
				if query_text in logFrequencyDict:
					logFrequencyDict[query_text] += 1
				else:
					logFrequencyDict[query_text] = 1
			else:
				break
	amount_correct = 0
	amount_wrong  =0
	counter = 0
	with open(googleLogFile, 'r+') as csvfile:
		reader = csv.reader(csvfile)
		next(reader) #SKIP THE HEADER
		guessResultsArray = []
		for log in reader:
			counter +=1
			query_text = log[1]
			actual_yes_no = log[2]
			#if counter < cutoffIndex:
			if counter <= cutoffIndex:
				if logFrequencyDict[query_text] > 1:
					guess = "Yes"
				else:
					guess = "No"
				guessResultsArray.append(guess)
				if actual_yes_no == guess:
					amount_correct +=1
				else:
					amount_wrong +=1
			else:
				break
	
	df = pd.read_csv(googleLogFile)
	df['Frequency Analysis'] = pd.Series(guessResultsArray)
	df.to_csv(googleLogFile, index=False)


	print ('amount_correct', amount_correct)
	print ('amount_wrong', amount_wrong)

	columnHeader = "Frequency Analysis"
	evaluateGuessArray(guessResultsArray, googleLogFile, columnHeader)

	return guessResultsArray

def analyzeByPopularSeedWords(googleLogFile, popularQueriesFile, cutoffIndex):
	'''
	Objective:
		Determine (guess) which Google search queries were made by TrackMeNot 
		and determine which Google search queries were authentic
	Method:
		For each search query in googleLogFile:
			if the query is in popularQueriesFile, then guess that it is 
			a trackMeNotQuery
			o.w guess that is is an authentic query (i.e. not trackMeNot)
	'''
	file = open(popularQueriesFile, "r") 
	popular_queries_set = {}
	for line in file:
		line = re.sub(r'\t\n', '', line)
		popular_queries_set.add(line)
	amount_correct = 0
	amount_wrong = 0
	with open(googleLogFile, 'r') as csvfile:
		reader = csv.reader(csvfile)
		next(reader) #SKIP THE HEADER
		guessResultsArray= []
		
		for log in reader:
			query_text = log[1]
			actual_yes_no = log[2]
			if counter <= cutoffIndex:
				if query_text in popular_queries_set:
					guess = "Yes"
				else:
					guess = "No"
				guessResultsArray.append(guess)
				if yes_no == actual_yes_no:
					amount_correct +=1
				else:
					amount_wrong +=1
			else:
				break


	df = pd.read_csv(googleLogFile)
	df['Popular Seed Analysis'] = pd.Series(guessResultsArray)
	df.to_csv(googleLogFile, index=False)


	print ('amount_correct', amount_correct)
	print ('amount_wrong', amount_wrong)

	columnHeader = "Popular Seed Analysis"
	evaluateGuessArray(guessResultsArray, googleLogFile, columnHeader)


	return guessResultsArray


def analyzeByPopularityAndFrequency(googleLogFile, frequencyGuessResults, popularityGuessResults):
	'''
	Objective:
		Determine (guess) which Google search queries were made by TrackMeNot 
		and determine which Google search queries were authentic
	Method:
		For each search query in googleLogFile:
			if analyzeByPopularSeedWords() or analyzeByQueryFrequency() guessed "Yes"
			(i.e. that it is a TrackMeNot query) then guess "yes"
			o.w. guess no (i.e. that it is not a TrackMeNot query)
	'''
	if len(frequencyGuessResults) != len(popularityGuessResults):
		return
	guessResultsArray = []
	for i in range(len(frequencyGuessResults)):
		if frequencyGuessResults[i] == "Yes" or popularityGuessResults[i] == "Yes":
			guess = "Yes"
		else:
			guess = "No"
		guessResultsArray.append(guess)
	columnHeader = "Popularity and Frequencye"
	evaluateGuessArray(guessResultsArray, googleLogFile, )

def evaluateGuessArray(guessResultsArray, googleLogFile, columnHeader):
	'''
	Given a guessArray
	evaluate it => determine how many guesses were right and how many were wrong
	also, make a new column in the googleLogFile recording the guesses
	'''
	index = 0
	amount_correct = 0
	amount_wrong = 0
	with open(googleLogFile, 'r') as csvfile:
		reader = csv.reader(csvfile)
		next(reader) #SKIP THE HEADER		
		for log in reader:
			actual_yes_no = log[2]
			guess = guessResultsArray[0]
			if guess == actual_yes_no:
				amount_correct +=1
			else:
				amount_wrong +=1

	print (header, "amount correct", amount_correct)
	print (header, "amount wrong", amount_wrong)

	df = pd.read_csv(googleLogFile)
	df[columnHeader] = pd.Series(guessResultsArray)
	df.to_csv(googleLogFile, index=False)


def main():
	googleActivityFile = 'MyActivity2.html'
	googleLogFile = 'GoogleSearchResults2.csv'
	trackMeNotLogFile = 'TrackMeNotLogs2.csv'
	popularQueriesFiles = 'popular_queries.txt'

	trackMeNotDict = getTrackMeNotDict(trackMeNotLogFile)

	createGoogleSearchFile(googleActivityFile, googleLogFile, trackMeNotDict)
	addTrackMeNotColumn(googleLogFile, trackMeNotDict)
	
	cutoffIndex = determineGoogleLogCutoff(googleLogFile, trackMeNotLogFile)
	frequencyGuessResults = analyzeByQueryFrequency(googleLogFile, trackMeNotLogFile, cutOffIndex)
	popularityGuessResults = analyzeByPopularSeedWords(googleLogFile, popularQueriesFiles, cutOffIndex)
	analyzeByPopularityAndFrequency(googleLogFile, frequencyGuessResults, popularityGuessResults)

if __name__ == "__main__":
	main()




# with open('Testing.csv', 'a') as csvfile:
	# 	fieldnames = ['GoogleTime', 'TrackMeNotTimes']
	# 	writer = csv.DictWriter(csvfile, fieldnames = fieldnames)
	# 	writer.writerow({'GoogleTime':googleTime,'TrackMeNotTimes':trackMeNotTimes})
	#print (trackMeParsedTimeArray)

	#return True
	#check that the googleTime is close enough to at least one of the trackMeNotTimes



	#addColumn()

#print (trackMeNotDict)
	# month = ['May']
	# day = [13, 14]
	# year = [2018]

	# with open('Testing.csv', 'w') as csvfile:
	# 	fieldnames = ['GoogleTime', 'TrackMeNotTimes']
	# 	writer = csv.DictWriter(csvfile, fieldnames = fieldnames)
	# 	writer.writeheader()




# googleParsed = parseGoogleTime(googleTime)
	# trackMeParsedTimeArray = parseTrackMeNotTime(trackMeNotTimes)
	# googleDateTime = datetime.datetime(googleParsed['year'],googleParsed['month'],googleParsed['day'],googleParsed['hour'],googleParsed['minute'],googleParsed['second'])
	# for trackMeEntry in trackMeParsedTimeArray:
	# 	trackMeDateTime = datetime.datetime(trackMeEntry['year'],trackMeEntry['month'],trackMeEntry['day'],trackMeEntry['hour'],trackMeEntry['minute'],trackMeEntry['second'])
	# 	diffTimeDelta = abs(trackMeDateTime - googleDateTime) 
	# 	if diffTimeDelta.seconds <= 10:
	# 		return True
	# return False

		