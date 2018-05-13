import re
internal = re.compile(
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
mytag = internal.search('asdfs May 3, 2018, 10:34:23 PM')
print (mytag)
print (type(mytag.group(0)))

#Mar 27, 2018, 11:13:16 PM



#hours needs to be 1 OR 2 digits
#day needs to be 1 or 2 digits
#particularly, the [123] needs to be optional