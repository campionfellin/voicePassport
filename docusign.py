from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import sys
import time

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException



#browser = webdriver.Chrome('./chromedriver')
browser = webdriver.PhantomJS('./phantomjs')
#browser = webdriver.Firefox()



browser.get(sys.argv[1])


#button = browser.find_element_by_css_selector("#action-bar-btn-continue")
while True:
	print "trying to click button"
	try: 
		button = browser.find_element_by_css_selector("#action-bar-btn-continue")
		if button:
			break
		
	except Exception:	
		pass
	time.sleep(2)
	print "asleep"


button.click()

while True:
	print "trying to click 2nd button"
	try: 
		button2 = browser.find_element_by_css_selector(".tab-button")
		if button:
			break
		
	except Exception:	
		pass
	time.sleep(2)
	print "asleep"

button2.click()

while True:
	print "trying to click 3rd button"
	try: 
		button3 = browser.find_element_by_css_selector("#action-bar-btn-finish")
		if button:
			break
		
	except Exception:	
		pass
	time.sleep(2)
	print "asleep"


button3.click()
print "signed and sealed"

browser.quit()
