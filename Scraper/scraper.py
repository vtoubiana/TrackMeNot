import codecs
import re
import csv
import datetime
import pandas as pd
import subprocess
import os.path


def getAllGoogleQueryTextsInSet(googleLogFile):
	'''
	Input:
		googleLogFile: (string) filename of google log file
	Output:
		set of all queries in googleLogFile file. 
		return only query text (i.e. don't return query times)
	'''
	query_text_set = set()
	with open(googleLogFile, 'r') as csvfile:
		reader = csv.reader(csvfile)
		next(reader) #SKIP THE HEADER
		for log in reader:
			query_text = log[1]
			query_text_set.add(query_text)
	return query_text_set
	
def getAllGoogleQueryTextsInList(googleLogFile):
	'''
	Input:
		googleLogFile: (string) filename of google log file
	Output:
		list of all queries in googleLogFile file. 
		return only query text (i.e. don't return query times)
		list is ordered by their order in googleLogFile
	'''
	query_text_list = []
	with open(googleLogFile, 'r') as csvfile:
		reader = csv.reader(csvfile)
		next(reader) #SKIP THE HEADER
		for log in reader:
			query_text = log[1]
			query_text_list.append(query_text)
	return query_text_list


def getAllGoogleQueryTimesInList(googleLogFile):
	'''
	Input:
		googleLogFile: (string) filename of google log file
	Output:
		list of all queries times in googleLogFile file. 
		return only query times (i.e. don't return query texts)
		list is ordered by their order in googleLogFile
	'''
	query_time_list = []
	with open(googleLogFile, 'r') as csvfile:
		reader = csv.reader(csvfile)
		next(reader) #SKIP THE HEADER
		for log in reader:
			query_time = log[0]
			query_time_list.append(query_time)
	return query_time_list

def getAllGoogleYesNoInList(googleLogFile):
	'''
	Input:
		googleLogFile: (string) filename of google log file
	Output:
		list of all actual yes/no values in googleLogFile file. 
		the yes/no values tell us if a given query was actually a 
		TrackMeNot query or not
		list is ordered by their order in googleLogFile
	'''
	actual_yes_no_list = []
	with open(googleLogFile, 'r') as csvfile:
		reader = csv.reader(csvfile)
		next(reader) #SKIP THE HEADER
		for log in reader:
			actual_yes_no = log[2]
			actual_yes_no_list.append(actual_yes_no)
	return actual_yes_no_list


def getPopularWords(popularQueriesFile):
	'''
	Input:
		popularQuerieFile: (string) filename of popular_queries.txt
	Output:
		set of all queries in popularQueriesFile file
	'''
	file = open(popularQueriesFile, "r") 
	popular_queries_set = set()
	for line in file:
		line = re.sub(r'\t\n', '', line)
		line = line.lower()
		popular_queries_set.add(line)
	return popular_queries_set


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
			query = log[4].lower() #lets be case insensitive	
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

	am_pm_format = re.compile(r'(?P<AM_PM>AM|PM)')
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
	Check that the time described by googleTime is within 20 seconds of
	one of the times in the trackMeNotTimes array
	'''
	googleDateTime = parseGoogleTime(googleTime)
	trackMeParsedTimeArray = parseTrackMeNotTime(trackMeNotTimes)
	#googleDateTime = datetime.datetime(googleParsed['year'],googleParsed['month'],googleParsed['day'],googleParsed['hour'],googleParsed['minute'],googleParsed['second'])
	for trackMeDateTime in trackMeParsedTimeArray:
		diffTimeDelta = abs(trackMeDateTime - googleDateTime) 
		if diffTimeDelta.seconds <= 20:
			return True
	return False

def checkTrackMeNotQuery(googleQuery, googleQueryTime, trackMeNotDict):
	'''
	Determines if a given google search query was made by TrackMeNot
	Does this by checking the tuple (googleQuery, googleQueryTime) against 
	the TrackMeNotDict {trackMeNotQuery: [array of times at which trackMeNoT query was made]}
	'''
	googleQuery = googleQuery.lower() #lets be case insensitive
	if googleQuery not in trackMeNotDict:
		return "No"
	else:
		trackMeNotTimes = trackMeNotDict[googleQuery] 
		timesMatch = compareQueryTimes(googleQueryTime, trackMeNotTimes)
		if timesMatch is True:
			return "Yes"
		else:
			return "No"


def createGoogleLogFile(googleActivityFile, googleLogFile, trackMeNotDict):
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
				r'(?P<AM_PM>AM|PM)' #   AM|PM)'
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

	queryTextList = getAllGoogleQueryTextsInList(googleLogFile)
	queryTimeList = getAllGoogleQueryTimesInList(googleLogFile)
	trackMeNotColumn = []
	for i in range(len(queryTextList)):
		trackMeNot = checkTrackMeNotQuery(queryTextList[i], queryTimeList[i], trackMeNotDict)
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
	#print (last_time_parsed)
	return last_time_parsed

def determineGoogleLogCutoff(googleLogFile, trackMeNotLogFile):
	'''
	Returns the index of log in googleLogFile that was made at time t
	where time t is the time of the earliest log in the TrackMeNotLogFile
	Unless trackMeNotLogFile is None
	'''
	if trackMeNotLogFile == "None":
		row_count = sum(1 for line in open(googleLogFile))
		if row_count < 1000:
			return row_count -1 #subtract 1 to account for header
		else:
			return 500
		#return row_count-1 #subtract 1 to account for header
	latestTrackMeNotDateTime = getLatestTrackMeNotTime(trackMeNotLogFile)
	cutoffIndex = 0
	
	queryTimeList = getAllGoogleQueryTimesInList(googleLogFile)
	for queryTime in queryTimeList:
		googleDateTime = parseGoogleTime(queryTime)
		diff = googleDateTime - latestTrackMeNotDateTime
		if diff.days >= 0:
				cutoffIndex +=1
		else:
			break
				
	return cutoffIndex


def analyzeByQueryFrequency(googleLogFile, cutoffIndex):
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
	queryTextList = getAllGoogleQueryTextsInList(googleLogFile)
	queryTimeList = getAllGoogleQueryTimesInList(googleLogFile)
	counter = 0
	for i in range(len(queryTextList)):
		queryText = queryTextList[i]
		queryTime = queryTimeList[i]
		#googleDateTime = parseGoogleTime(queryTime)
		counter +=1
		if counter <= cutoffIndex:
			if queryText in logFrequencyDict:
				logFrequencyDict[queryText] += 1
			else:
				logFrequencyDict[queryText] = 1
		else:
			break
	counter = 0
	
	guessResultsArray = []
	for i in range(len(queryTextList)):
		queryText = queryTextList[i]
		queryTime = queryTimeList[i]
		counter +=1
		if counter <= cutoffIndex:
			if logFrequencyDict[queryText] >1:
				guess = "Yes"
			else:
				guess = "No"
			guessResultsArray.append(guess)
		else:
			break

	columnHeader = "Frequency Analysis"
	evaluateGuessArray(guessResultsArray, googleLogFile, columnHeader, cutoffIndex)

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
	popularQueriesSet = getPopularWords(popularQueriesFile)
	# amount_correct = 0
	# amount_wrong = 0
	counter = 0

	queryTextList = getAllGoogleQueryTextsInList(googleLogFile)
	actualYesNoList = getAllGoogleYesNoInList(googleLogFile)
	guessResultsArray = []
	for i in range(len(queryTextList)):
		queryText = queryTextList[i]
		queryText = queryText.lower()
		actualYesNo = actualYesNoList[i]
		counter += 1
		if counter <= cutoffIndex:
			if queryText in popularQueriesSet:
				guess = "Yes"
			else:
				guess = "No"
			guessResultsArray.append(guess)
		else:
			break

	columnHeader = "Popular Seed Analysis"
	evaluateGuessArray(guessResultsArray, googleLogFile, columnHeader, cutoffIndex)

	return guessResultsArray


def analyzeByPopularityAndFrequency(googleLogFile, frequencyGuessResults, popularityGuessResults, cutoffIndex):
	'''
	Inputs:
		googleLogFile: (string) name of google log file
		frequencyGuessResults: (array) of guess results from analyzeByQueryFrequency()
		popularityGuessResults: (array) of guess results from analyzeByPopularSeedWords()
		cutoffIndex: (int) index returned from determineGoogleLogCutoff()

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
	columnHeader = "Popularity and Frequency Analysis"
	evaluateGuessArray(guessResultsArray, googleLogFile, columnHeader, cutoffIndex)

def evaluateGuessArray(guessResultsArray, googleLogFile, columnHeader, cutoffIndex):
	'''
	Given a guessArray
	evaluate it => determine how many guesses were right and how many were wrong
	also, make a new column in the googleLogFile recording the guesses
	'''
	index = 0
	amount_correct = 0
	amount_wrong = 0

	counter = 0

	queryTextList = getAllGoogleQueryTextsInList(googleLogFile)
	queryTimeList = getAllGoogleQueryTimesInList(googleLogFile)
	actualYesNoList = getAllGoogleYesNoInList(googleLogFile)
	for i in range(len(queryTextList)):
		queryText = queryTextList[i]
		queryTime = queryTimeList[i]
		actualYesNo = actualYesNoList[i]
		if counter < cutoffIndex:
			guess = guessResultsArray[counter]
			counter +=1
			if guess == actualYesNo:
					amount_correct +=1
			else:
				amount_wrong +=1
		else:
			break
	if amount_correct == 0:
		percent_right = 0
	else:
		percent_right = round(((amount_correct / (amount_correct + amount_wrong)) * 100), 2)

	print (columnHeader, "amount correct", amount_correct)
	print (columnHeader, "amount wrong", amount_wrong)
	print (columnHeader, "percent right", percent_right)

	df = pd.read_csv(googleLogFile)
	df[columnHeader] = pd.Series(guessResultsArray)
	df.to_csv(googleLogFile, index=False)

	with open("output.txt", "a") as out:
		out.write("\n")
		out.write("*******************************" + "\n")
		out.write(columnHeader + "\n\n")
		out.write("Amount Correct: " + str(amount_correct) + "\n")
		out.write("Amount Wrong :" + str(amount_wrong) + "\n")
		out.write("Percent Right : " + str(percent_right) + "\n")
		out.write("*******************************" + "\n")

def evaluateUserUsing(guess, experimentName):
	'''
	Input:
		guess: (boolean) true iff determined that user is using TrackMeNot
		experimentName (string) name of experiment run
	Output:
		None
	Functionality:
		Update output.txt with appropriate Information
	'''
	if guess == True:
		writeIn = "We think this user is using TrackMeNot"
	else:
		writeIn = "We do not think this user is using TrackMeNot"
	with open("output.txt", "a") as out:
		out.write("\n\n\n")
		out.write("*******************************" + "\n")
		out.write(experimentName + "\n\n")
		out.write(writeIn + "\n")
		out.write("*******************************" + "\n")

def userUsingPopularityCheck(googleLogFile, popularQueriesFile):
	'''
	Objective:
		Determine if a user is using TrackMeNot or not
	Returns:
		True if user is using TrackMeNot
		False if user is not using TrackMeNot
	Method:
		Check numIterations most recent search queries
		If thresholdPercentage% of them are in TrackMeNot's popular seed list, 
		then return True
		o.w. return False
	'''
	popularQuerySet = getPopularWords(popularQueriesFile)
	googleQueryTextList = getAllGoogleQueryTextsInList(googleLogFile)
	numberOfPopular = 0
	numIterations = 500
	thresholdPercentage = 25
	for i in range(numIterations):
		thisQuery = googleQueryTextList[i].lower()
		if thisQuery in popularQuerySet:
			#print ("popular query", thisQuery)
			numberOfPopular +=1
	#print ("Number Popular", numberOfPopular)
	percentPopular = round(((numberOfPopular / numIterations) * 100),2)
	#print ("Percent Popular", percentPopular)
	experimentName = "Looking for Queries in TrackMeNot's Popular List"
	if percentPopular > thresholdPercentage:
		writeIn = "We think this user is using TrackMeNot"
		result = True
	else:
		writeIn = "We do not think this user is using TrackMeNot"
		result = False

	with open("output.txt", "a") as out:
		out.write("\n")
		out.write("*******************************" + "\n")
		out.write(experimentName + "\n\n")
		out.write(writeIn + "\n")
		out.write(str(percentPopular) + "% of their search queries are in TrackMeNot's 'popular queries' list" + "\n")
		out.write("Our threshold is "+str(thresholdPercentage)+"%" +'\n')
		out.write("*******************************" + "\n")
	
	return result

def userUsingFrequencyCheck(googleLogFile):
	'''
	Objective:
		Determine if a user is using TrackMeNot or not
	Returns:
		True if user is using TrackMeNot
		False if user is not using TrackMeNot
	Method:
		Check numIterations most recent search queries
		If thresholdPercentage% of them were repeated, 
		then return True
		o.w. return False
	'''
	googleQueryTextList = getAllGoogleQueryTextsInList(googleLogFile)
	numIterations = 500
	queryDict = {}
	thresholdPercentage = 30
	for i in range(numIterations):
		thisQuery = googleQueryTextList[i]
		if thisQuery in queryDict:
			queryDict[thisQuery] +=1
		else:
			queryDict[thisQuery] = 1
	numRepeated = 0
	for query in queryDict.keys():
		if queryDict[query] > 1:
			numRepeated +=1
	percentRepeated = round(((numRepeated / len(queryDict)) * 100), 2)
	experimentName = "Observing Frequency of Queries"
	if percentRepeated > thresholdPercentage:
		writeIn = "We think this user is using TrackMeNot"
		result = True
	else:
		writeIn = "We do not think this user is using TrackMeNot"
		result = False
	with open("output.txt", "a") as out:
		out.write("\n")
		out.write("*******************************" + "\n")
		out.write(experimentName + "\n\n")
		out.write(writeIn + "\n")
		out.write(str(percentRepeated) + "% of their past " + str(numIterations) + " search queries were repeats" + "\n")
		out.write("Our threshold is "+str(thresholdPercentage)+"%" +'\n')
		out.write("*******************************" + "\n")



def whenIsUserUsingPopularityCheck(googleLogFile, popularQueriesFile):
	'''
	Input:
		googleLogFile (string) name of google log file
		popularQueriesFile (string) name of file containing TrackMeNot's
		popular queries
	Returns:
		None
	Functionality:
		Determines when TrackMeNot is on and when it is off
	Method:
		Look at search history in 'windows' of 100 queries. 
		For each query, IF of the 50 queries that happened immediately before it
		and the 50 queries that happened immediately after it, threshold% of them are
		in popularQueriesFile, then trackMeNot is on at that instant
	'''
	threshold = 25
	trackMeNotOnOffArray = []
	popularQuerySet = getPopularWords(popularQueriesFile)
	googleQueryTextList = getAllGoogleQueryTextsInList(googleLogFile)
	
	#index 0 to 49

	numberOfPopular = 0
	for i in range(0,50):
		thisQuery = googleQueryTextList[i]
		if thisQuery in popularQuerySet:
			numberOfPopular +=1
	percentPopular = round(((numberOfPopular / 50) * 100),2)
	if percentPopular > threshold:
		firstFifty = ["Yes"] * 50	
	else:
		firstFifty = ["No"] * 50
	trackMeNotOnOffArray.extend(firstFifty)
	#index 50 to len(googleQueryTextList) - 50
	middleQueries = []
	for i in range(50, len(googleQueryTextList)-50):
		numberOfPopular = 0
		for j in range(i-50, i+50):
			thisQuery = googleQueryTextList[i]
			if thisQuery in popularQuerySet:
				numberOfPopular +=1
		thisPercentPopular = round(((numberOfPopular / 100) * 100),2)
		if thisPercentPopular > threshold:
			middleQueries.append("Yes")
		else:
			middleQueries.append("No")
	trackMeNotOnOffArray.extend(middleQueries)
	
	numberOfPopular = 0
	for i in range(len(googleQueryTextList)-50, len(googleQueryTextList)):
		thisQuery = googleQueryTextList[i]
		if thisQuery in popularQuerySet:
			numberOfPopular +=1
	percentPopular = round(((numberOfPopular / 50) * 100),2)
	if percentPopular > threshold:
		lastFifty = ["Yes"] * 50	
	else:
		lastFifty = ["No"] * 50
	trackMeNotOnOffArray.extend(lastFifty)

	df = pd.read_csv(googleLogFile)
	df['Is TrackMeNot On'] = trackMeNotOnOffArray
	df.to_csv(googleLogFile, index=False)
		

def prepareOutputFile():
	with open('output.txt','w') as out:
		out.write("Results from TrackMeNot Analysis" + "\n")

def dataCleaningAndSetup(googleActivityFile, googleLogFile,trackMeNotLogFile,popularQueriesFile):
	'''
	These functions serve to set up the data (generate necessary csv files) and clean up the data
	so that they can be analyzed. More info provided in each function
	'''
	if trackMeNotLogFile is 'None':
		trackMeNotDict = {}
	else:
		trackMeNotDict = getTrackMeNotDict(trackMeNotLogFile)
	createGoogleLogFile(googleActivityFile, googleLogFile, trackMeNotDict)
	addTrackMeNotColumn(googleLogFile, trackMeNotDict)

def individualQueryAnalysis(googleActivityFile, googleLogFile,trackMeNotLogFile,popularQueriesFile):
	'''
	These functions observe each individual query and for each query determines if it was generated
	by TrackMeNot or if it was an authentic query 
	'''
	
	cutoffIndex = determineGoogleLogCutoff(googleLogFile, trackMeNotLogFile)
	frequencyGuessResults = analyzeByQueryFrequency(googleLogFile, cutoffIndex)
	popularityGuessResults = analyzeByPopularSeedWords(googleLogFile, popularQueriesFile, cutoffIndex)
	analyzeByPopularityAndFrequency(googleLogFile, frequencyGuessResults, popularityGuessResults, cutoffIndex)

def isUserUsingTrackMeNotAnalysis(googleLogFile, popularQueriesFile):
	'''
	These functions observe an individuals search history and seek to determine if they are using
	TrackMeNot or not
	'''
	userUsingPopularityCheck(googleLogFile, popularQueriesFile)
	userUsingFrequencyCheck(googleLogFile)

def whenIsUserUsingTrackMeNot(googleLogFile, popularQueriesFile):
	'''
	These functions observe an inviduals search history and seek to determine when, if at all,
	they have TrackMeNot turned and when, if at all, they have trackMeNot turned off
	'''
	whenIsUserUsingPopularityCheck(googleLogFile, popularQueriesFile)

def main():
	googleActivityFile = './Takeout/My Activity/Search/MyActivity.html'
	googleLogFile = 'GoogleSearchResults.csv' #
	if os.path.isfile('TrackMeNotLogs.csv'):
		trackMeNotLogFile = 'TrackMeNotLogs.csv'
	else:
		trackMeNotLogFile = 'None' 
	popularQueriesFile = 'popular_queries.txt'

	dataCleaningAndSetup(googleActivityFile, googleLogFile,trackMeNotLogFile, popularQueriesFile)
	prepareOutputFile()
	individualQueryAnalysis(googleActivityFile, googleLogFile,trackMeNotLogFile, popularQueriesFile)
	isUserUsingTrackMeNotAnalysis(googleLogFile, popularQueriesFile)
	whenIsUserUsingTrackMeNot(googleLogFile, popularQueriesFile)

if __name__ == "__main__":
	main()










		