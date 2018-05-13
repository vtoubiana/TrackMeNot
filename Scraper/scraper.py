import codecs
import re

f=codecs.open("MyActivity.html", 'r')
#print f.read()

try: 
    from BeautifulSoup import BeautifulSoup
except ImportError:
    from bs4 import BeautifulSoup
# href = re.compile('https://www.google.com/search\?q=\w+')
# href = re.compile('https://www.google.com/search\?q=[a-zA-Z0-9]*')
href = re.compile('https://www.google.com/search\?q=[a-zA-Z0-9]*')
html = f.read() #the HTML code you've written above
parsed_html = BeautifulSoup(html, "lxml")
#href = 'https://www.google.com/search?q=' + p
# for wrapper in (parsed_html.body.find_all('a', attrs={'href':href})):
# 	print (wrapper.text)
# 	print (type(wrapper.text))

for wrapper in (parsed_html.body.find_all('div', attrs={'class':'content-cell mdl-cell mdl-cell--6-col mdl-typography--body-1'})):
	
	time_format = re.compile(
			r'(?P<month>May|Dec)' 
			r'([ ])'
			r'(?P<day>[123]?[0-9])'
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
			r'(?P<AM_PM>AM|PM)'
			)
	time_tag_match = time_format.search(wrapper.text)
	if time_tag_match is not None:
		time_tag_str = time_tag_match.group(0)
		time_index = wrapper.text.find(time_tag_str)
		search_for_index = len('Searched for')
		search_text = wrapper.text[search_for_index+1:time_index]
		time_text = wrapper.text[time_index:]
		print (search_text, time_text)
		




		