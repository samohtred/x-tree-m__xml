README - X-TREE-M
=================


1. What is X-Tree-M ?
---------------------

X-Tree-M ('eXtended Tree Method') is aimed to be a kind of wiki to collect all arguments, questions, facts, etc.
in a tree-like topic-structure. The goal is to prevent redundant discussions, to share knowledge and arguments
between Millions of people and to support new political activists to get substantial knowledge pretty fast and
enable them to start discussing at a higher level.
This tree structure is not intended to be an ordinary one since it is possible that two completely different 
main topics can share the same subtopic. In the future it should be possible (in case of open questions and problems) 
to provide a sophisticated workflow to solve open issues like projects. The following list provides an overview 
of other future features :


- statement extraction from fulltext sources such as chats, emails, forums, etc.
- fulltext creator -> select items from the argument / fact tree, bring them into the proper order and
  re-formulate them to make them fit in a fulltext
- merge of databases
- local copy of database for offline usage
- user login
- back / forward functionality
- comprehensive help system
- item-wise chat
- item-wise change history
...


2. Currently implemented features :
-----------------------------------

- automatic panel browsing by mouseover
- different views : Tree and Bubble
- fulltext explanation of an item
- multilayer voting
- language setup : German / English
- Database selection
- several commands (New, Change, Delete, Copy by Ref, Clone, Cut, Paste)
- huge keyboard support (fast typing / fast control)
- DB-Export to HTML
- focus on a sub-tree by locking it as root item
- News-Ticker
- Event-Ticker
- several Elem-Types (Topic, Pro, Contra, Fact, Idea, Question, Problem, Goal, etc.)
- Favorites (Bookmarks)
- Error-Log
- limit title in the tree to a certain amount of letters
- alphabetical / categorical sorting
- multiple Browser support (currently : IE, Firefox)
- parametrized call to support change between tools


3. File description :
---------------------

export_html.php
	- PHP script for HTML export of database

global_defs.js
	- global constants
global_dispatcher.js
	- global init 
	- panel resize for panel browsing
	- gate for every event (keyboard, timer, mouse, ...)
global_functions.js
	- global functions (e.g. for compatibility)
global_lang.js
	- Language file to change between messages / titles of several languages
global_setup.js
	- global setup (version, language, etc.)
index.php
	- Entry-Point to the Website  (can be called using parameters -> have a look inside the file)
lib_data_cookie.js
	- function library for easy handling of cookies
lib_data_disco.js
	- function library if database is switched to "DISCO" (old database backend system meant to be used by several discussion tools 
		to share content and users)
lib_data_dispatcher.js
	- no matter what database is set up, this is the abstract database layer for every database technology
lib_data_html.js
	- function library for HTML export
lib_data_lang.js
	- file to support language switching for database related texts; maybe this should be merged with another (global) language file
lib_data_xml.js
	- function library if database is switched to "XML" (data is simply stored into an XML file)
lib_dbg_log.js
	- function library to support easy-to-use debug logging
lib_dbg_log2email.php
	- Debug Logs can be emailed through this library
lib_tree.js
	- actual function library to handle the tree / bubble view of the items
lib_tree_lang.js
	- language file (item types, etc.)
symbol_xxxxxxxxxxxx.gif
  -> symbols for different element types
uc_browsing_content.js
	- everything to handle the content panel of an item
uc_browsing_dispatcher.js
	- actually the heart of the system where everything comes together (handling of GUI, database, control, etc.)
uc_browsing_features.js
	- features panel on bottom (for bookmarks and other future features such as chat)
uc_browsing_infopanel.js
	- info panel on right where global information is displayed (News Ticker, Date Ticker, changed items in the future)
uc_browsing_lang.js
	- language file to the "Browsing" usecase (for menu, messages, titles, etc.)
uc_browsing_menubar.js
	- menubar handling				
uc_browsing_setup
	- actually used config for the usecase ("UC") "browsing" (browsing through the tree
uc_browsing_setup__DISCO.js
	- not used - only to show how the setup for the old DISCO database version has to be made
uc_browsing_setup__XML.js
	- not used - only to show how the setup for the local XML database version (Apache on local PC) has to be made
uc_browsing_setup_online.js
	- not used - only to show how the setup for the remote XML database version (on server) has to be made
uc_browsing_toolbar.js
	- toolbar line directly below menubar (displays currently selected language, item type and region)
uc_browsing_tree_db.xml
	- actual database (data is stored in XML file)
uc_browsing_upload.php
	- PHP script to store data in XML file on server
uc_merging_dispatcher.js
	- unfinished Usecase "Merging" (meant to merge different databases of several groups into one)
	
