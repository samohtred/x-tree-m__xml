<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 5.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html style="margin-top:0.8em; margin-right:1.1em; height:100%; width:100%; overflow: hidden;">

  <head>    

    <title>X-Tree-M</title>               
    <script src="//d3js.org/d3.v3.min.js"></script>
    <script src="jquery.js"></script>
    <script src="datajs-1.0.3.js"></script>
    <script src="jaydata.js"></script>
    <script src="oDataProvider.js"></script>                                                                                                                                                               
    <script src="global_defs.js"></script>
    <script src="global_functions.js"></script>
    <script src="lib_dbg_log.js"></script>
    <script src="lib_tree_lang.js"></script>
    <script src="lib_tree.js"></script>
    <script src="lib_data_html.js"></script>    
    <script src="lib_data_xml.js"></script>
    <script src="lib_data_disco.js"></script>    
    <script src="lib_data_lang.js"></script>
    <script src="lib_data_cookie.js"></script>
    <script src="lib_data_dispatcher.js"></script>
    <script src="global_setup.js"></script>
    <script src="global_dispatcher.js"></script>
    <script src="global_lang.js"></script>
    <script src="uc_browsing_setup.js"></script>
    <script src="uc_browsing_lang.js"></script>
    <script src="uc_browsing_menubar.js"></script>
    <script src="uc_browsing_toolbar.js"></script>
    <script src="uc_browsing_dispatcher.js"></script>
    <script src="uc_browsing_content.js"></script>
    <script src="uc_browsing_infopanel.js"></script>    
    <script src="uc_browsing_features.js"></script>        
    <script src="disco.ontology.js"></script>                                                                                
    <script>
      // for parametrized call, e.g. : main.x-tree-m.bplaced.net/disco/index.php?item_id="575"&cb_toolname="qKonsens"&cb_url="http://main.x-tree-m.bplaced.net/disco/index.php\?item_id="
      var param_cb_toolname = <?php echo isset($_GET['cb_toolname']) ? $_GET['cb_toolname'] : "undefined"; ?>;    // Callback-Toolname; e.g. "qKonsens"
      var param_cb_url = <?php echo isset($_GET['cb_url']) ? $_GET['cb_url'] : "undefined"; ?>;                   // Callback-URL; e.g. "http://main.x-tree-m.bplaced.net/disco/index.php\?item_id=" -> Item ID is appended !!!
      var param_item_id = <?php echo isset($_GET['item_id']) ? $_GET['item_id'] : "undefined"; ?>;                // Post-ID of item which is to be displayed in X-Tree-M; e.g. "575"
      // DISCO-Init
      Disco = $data.generatedContext;
      Context = $data.generatedContext.createContext("http://disconet.lynx.uberspace.de/node/api/odata");
      // Post 1 aufrufen : 
      // http://disconet.lynx.uberspace.de/node/api/odata/Posts?$filter=(Id%20eq%201)&$expand=Content,RefersTo,ReferredFrom/Referrer/Content,ReferredFrom/Referrer/RefersTo,ReferredFrom/Referrer/ReferredFrom      
    </script>                                                                                                                                                      
  </head>

  <body onload="global_dispatcher_init();" onresize="global_dispatcher_win_resize();" style="background-color: #6060FF; width:100%; height:100%;">

    <div id="div_menubar" style="padding-left:0.2em; color:#000000; width:100%; height:20px;">
      <B>Menubar</B>
    </div>  

    <div id="div_toolbar" style="color:#B0B0FF; padding-left:0.0em; margin-top:-0.6em; margin-bottom:-0.0em; width:100%; height:25px;">
      <B>Toolbar</B>
    </div>

    <div id="div_middle_area" style="height:400px;">  
      <table>    
        <tr>
          <td onMouseOver=global_dispatcher_change_panel_focus(0) >
            <div id="div_panel1" style="background-color:#FFFFFF; width:800px; height:400px;">
              <div id="div_panel1_headline" style="background-color:#0000D0; color:#B0B0FF; padding-left:0.3em;  height:20px;">
                <B> Panel1</B>     
              </div>
              <div id="div_panel1_content" style="background-color:#DFEFFF; height:380px; overflow:auto; overflow-x:auto;">
                <div id="div_panel1_pad" style="color:#3030C0; width:100%; height:100%; overflow:visible; white-space:nowrap;">
                  Loading Data. Please wait ...
                </div>
              </div>
            </div>
          </td>
          <td onMouseOver=global_dispatcher_change_panel_focus(1)>
            <div id="div_panel2" style="background-color:#FFFFFF; width:100px; height:400px;">        
              <div id="div_panel2_headline" style="background-color:#0000D0; color:#B0B0FF; padding-left:0.3em; height:20px;">
                <B>Panel2</B>
              </div>
              <div id="div_panel2_content" style="background-color:#DFEFFF; height:380px; overflow:auto;">
                <div id="div_panel2_pad" style="color:#3030C0; width:100%; height:100%; overflow:visible; white-space:nowrap;">      
                  Loading Data. Please wait ...
                </div>
              </div>
            </div>
          </td>
          <td>
            <div id="div_panel3" style="background-color:#FFFFFF; width:100px; height:400px;">
              <div id="div_panel3_headline" style="background-color:#0000D0; color:#B0B0FF; padding-left:0.3em; height:20px;">
                <B>Panel3</B>
              </div>
              <div id="div_panel3_content" style="background-color:#DFEFFF; height:380px; overflow:auto; overflow-x:auto;">
                <div id="div_panel3_pad" style="color:#3030C0; width:100%; height:100%; overflow:visible; white-space:nowrap;">  
                  Loading Data. Please wait ...
                </div>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>
    <div id="div_panel4" style="margin-top:0.3em; margin-left : 0.2em; margin-right : 0.2em; margin-bottom:0.7em; background-color:#FFFFFF; height:80px;">
      <div id="div_panel4_headline" style="background-color:#0000D0; color:#B0B0FF; padding-left:0.3em;  height:20px;">
        <B>Panel4</B>
      </div>
      <div id="div_panel4_content" style="background-color:#DFEFFF; height:100%; overflow:auto;">
        <div id="div_panel4_pad" style="color:#3030C0; width:100%; height:100%; overflow:visible; white-space:nowrap;">
          Loading Data. Please wait ...
        </div>        
      </div>      
    </div>
  </body>
</html>
