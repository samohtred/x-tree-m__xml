function uc_browsing_dispatcher( cb_clicked_at_str )    // notwendige DISCO-�nderungen am Ende !
{
  // take over params into object
  this.cb_clicked_at_str = cb_clicked_at_str;
  
  // bind functions to object
  this.select_by_id = uc_browsing_dispatcher_select_by_id.bind(this);
  this.select_item = uc_browsing_dispatcher_select_item.bind(this);
  this.select_parent = uc_browsing_dispatcher_select_parent.bind(this);
  this.is_loop = uc_browsing_dispatcher_is_loop.bind(this);
  this.process_elem_menu = uc_browsing_dispatcher_process_elem_menu.bind(this);
  this.process_type_menu = uc_browsing_dispatcher_process_type_menu.bind(this);  
  this.process_fav_menu = uc_browsing_dispatcher_process_fav_menu.bind(this);    
  this.keyb_proc = uc_browsing_dispatcher_keyb_proc.bind(this);
  this.create_db = uc_browsing_dispatcher_create_db.bind(this);
  this.clicked_at = uc_browsing_dispatcher_clicked_at.bind(this);
  this.switch_display = uc_browsing_dispatcher_switch_display.bind(this);
  this.load_setup = uc_browsing_dispatcher_load_setup.bind(this);
  this.save_setup = uc_browsing_dispatcher_save_setup.bind(this);
  this.init = uc_browsing_dispatcher_init.bind(this);
  this.lang_change = uc_browsing_dispatcher_lang_change.bind(this);
  this.update_info_panel = uc_browsing_dispatcher_update_info_panel.bind(this);


  // object variables
                                    // Storage Objects
  this.db_obj;
  this.def_parent_storage;
  this.dbg_log;

                                    // GUI Objects
  this.menubar;
  this.toolbar;
  this.tree_panel;
  this.content_panel;
  this.info_panel;
                                    // control variables
  this.panel1_selected_items = [];
  this.panel1_selected_items_afterop = [];
  this.panel1_cut_items = [];
  this.panel1_copied_items = [];  
  this.panel1_select_idx = 1;
  this.panel1_elem_type = 0;
  this.panel1_new_tree_item_input = false;
  this.panel1_saved_rename_item = null;
  this.panel1_input_too_long_occured = false;
//  this.panel1_display_type = 0;     // 0=tree; 1=bubbles
  this.text_focus = 0;
  this.my_path = "";

  // constructor call
  this.init();    
} 

function uc_browsing_dispatcher_lang_change()
{                                 
  this.menubar.init();
  this.toolbar.init(this.panel1_elem_type);
  this.tree_panel.print_title();
  this.content_panel.print_title();
  this.info_panel.print_title();
  this.info_panel.init_gui([]);
  this.features_panel.print_title();
}


function uc_browsing_dispatcher_select_by_id(elem_id)
{
                              // print whole tree + create new selection
  var curr_tree_part = this.db_obj.command({}, "get_tree");
  this.panel1_selected_items = [];                            
  this.panel1_selected_items[0] = this.tree_panel.print_tree(curr_tree_part, elem_id);
  this.panel1_select_idx = 1;
                              // save setup
  uc_browsing_setup.tree_last_selected = this.panel1_selected_items[0].elem_id;
  this.save_setup();
                              // load content of currently selected into Panel 2
                              // To-Do : Try to convince Paul and Marc to separate Title / Short Text from Full Text
  this.content_panel.load_item_content(this.tree_panel.get_item_data(this.tree_panel.get_gui_id(uc_browsing_setup.tree_last_selected)[0])); 
}


function uc_browsing_dispatcher_select_item(submodule, gui_id, mode)
{
  switch (mode)
  {
    case c_KEYB_MODE_CTRL_ONLY : 
        var add_item = true;        // false : 
        var loop_num = this.panel1_selected_items.length;
        var i=0;
        do 
        {
                                    // found selected item
          if (this.panel1_selected_items[i].gui_id == gui_id)
          {
            add_item = false;
            {
                                    // deselect and remove from selected list
              this.tree_panel.markup_items(this.panel1_selected_items[i].gui_id, false);
              this.panel1_selected_items.splice(i, 1);
              loop_num--;
            }
          }   
          else    
            i++;
        } while ( i<loop_num);
        this.panel1_select_idx = this.panel1_selected_items.length;
        if (add_item == true)                                              
        {
          this.panel1_selected_items[this.panel1_select_idx]=this.tree_panel.get_item_data(gui_id);
          this.tree_panel.markup_items(gui_id, true);      
          this.panel1_select_idx++;
        }
    break;

    case c_KEYB_MODE_SHIFT_ONLY :
        // to be defined
    break;
    
    case c_KEYB_MODE_NONE :
                                    // get item object
        var new_item = this.tree_panel.get_item_data(gui_id); 
                                    // if multiple parents -> save default
        if (new_item.isMultiPar)
          this.db_obj.command(this.tree_panel.get_defpar_pairs(gui_id), "set_default_parents");                                      
                                    // renew selection
        var selected_items_old = jQuery.extend(true, [], this.panel1_selected_items);
        this.panel1_selected_items = [];
        this.panel1_selected_items[0] = jQuery.extend(true, {}, new_item);
                                    // save setup
        uc_browsing_setup.tree_last_selected = new_item.elem_id;
        this.save_setup();
                                    // Siblings ? -> recycle tree data
        if ((new_item.parent_gui_id == selected_items_old[0].parent_gui_id) && (global_setup.display_type == 0))
        {
          for (var i=0; i<selected_items_old.length; i++)
          {  
            this.tree_panel.markup_items(selected_items_old[i].gui_id, false);
          }
          this.tree_panel.markup_items(new_item.gui_id, true);          
          this.content_panel.load_item_content(new_item);                                              
        }
                                    // otherwise : request tree data from database  
        else
        {
          var on_click_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'show_tree\', \'T0_a\', c_KEYB_MODE_NONE);";    
          this.db_obj.command({elemId:[new_item.elem_id], lock_id:uc_browsing_setup.tree_locked_item, favIds:[], tickerIds:[], cb_fct_call:on_click_str, mode:"tree_only"}, "req_tree");
        }

    break;
    
    default :  
        alert(c_LANG_UC_BROWSING_MSG_INVALID_KEYB_MODE[global_setup.curr_lang]);
    break;
  }
}


function uc_browsing_dispatcher_select_parent(parent_id)
{
                                    // redraw Main Tree + create new selection
  if (this.panel1_selected_items[0].isMultiPar)                                    
    this.db_obj.command([{elem_id:this.panel1_selected_items[0].elem_id, parent_id:parent_id}], "set_default_parents");   
  var on_click_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'show_tree\', \'T0_a\', c_KEYB_MODE_NONE);";            
  this.db_obj.command({elemId:[this.panel1_selected_items[0].elem_id], lock_id:uc_browsing_setup.tree_locked_item, favIds:[], tickerIds:[], cb_fct_call:on_click_str, mode:"tree_only"}, "req_tree"); 
}
  
  
                                 
                                 
function uc_browsing_dispatcher_is_loop(dest_item, src_items)
{
  var retval = false; 
  
  var dest_tree_part = this.db_obj.command({}, "get_tree");  
  for (var i=0; i<src_items.length; i++)
  {
    for (var j=0; j<dest_tree_part.explorer_path.length; j++)
    {
      if (src_items[i].elem_id == dest_tree_part.explorer_path[j].elem_id)
        retval = true;
    }
    if (src_items[i].elem_id == dest_item.elem_id)
      retval = true; 
  }
  return retval;
}
                                 

function uc_browsing_dispatcher_process_elem_menu(item)
{
  if (item != "paste_item")
  {
    if (this.panel1_cut_items.length >0)
    {
      this.tree_panel.mark_items_as_cut(this.panel1_cut_items, false);
    }
    this.panel1_cut_items = [];
    this.panel1_copied_items = [];     
  }
  
  switch (item)
  {
    case "input_item" :
        this.text_focus = 1;  
        this.panel1_input_too_long_occured = false;                                    
        // input new item
        if (this.panel1_selected_items.length==1)
        {
          this.panel1_new_tree_item_input = true;
          this.tree_panel.input_item(true, this.panel1_selected_items[0].gui_id, this.panel1_selected_items[0].type);
        }
        else
          alert(c_LANG_WARNING_SINGLE_ITEM_NEEDED[global_setup.curr_lang]);
        break;          
    case "change_item" :
        this.text_focus = 1;    
        this.panel1_input_too_long_occured = false;        
        if (this.panel1_selected_items.length==1)
        {
          this.panel1_saved_rename_item = this.panel1_selected_items[0];
          this.tree_panel.input_item(false, this.panel1_selected_items[0].gui_id, this.panel1_selected_items[0].type);
        }
        else
          alert(c_LANG_WARNING_SINGLE_ITEM_NEEDED[global_setup.curr_lang]);
        break;          
    case "delete_item" :
        if (this.panel1_selected_items.length!=0) 
        {
          if (this.panel1_selected_items[0].elem_id != uc_browsing_setup.tree_data_src_params.root_item)
          {
                                      // new selection : parent of current selection
            var new_sel0 = this.tree_panel.get_item_data(this.panel1_selected_items[0].parent_gui_id); 
            var selected_items_old = jQuery.extend(true, [], this.panel1_selected_items);              
            this.panel1_selected_items=[];
            this.panel1_selected_items[0]= new_sel0;
            this.panel1_select_idx = 1; 
            uc_browsing_setup.tree_last_selected = new_sel0.elem_id;
            this.save_setup();
                                      // delete all selected items from database and update tree in GUI
            var sel_item_ids = [];
            for (var i=0; i<selected_items_old.length; i++) {  sel_item_ids[i] = selected_items_old[i].elem_id; }
            var on_click_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'show_tree\', \'T0_a\', c_KEYB_MODE_NONE);";            
            this.db_obj.command({parentId:new_sel0.elem_id, itemId:sel_item_ids, lock_id:uc_browsing_setup.tree_locked_item, cb_fctn_str:on_click_str}, "delete_item");
          }
          else
            alert(c_LANG_WARNING_WRONG_SELECTION[global_setup.curr_lang]);
        }
        else
          alert(c_LANG_WARNING_NOTHING_SELECTED[global_setup.curr_lang]);
        break;
    case "clone_item" :
        alert("Not yet implemented !");
        break;
    case "copy_item"   :
        this.panel1_copied_items = jQuery.extend(true, [], this.panel1_selected_items);
        break;
    case "cut_item"    :
        this.panel1_cut_items = jQuery.extend(true, [], this.panel1_selected_items);
        this.tree_panel.mark_items_as_cut(this.panel1_selected_items, true);
        break;
    case "paste_item"  :
                                    // number of destination nodes which are selected == 1
        if (this.panel1_selected_items.length==1) 
        {
          if (this.panel1_cut_items.length != 0) 
          {
            if (!this.is_loop(this.panel1_selected_items[0], this.panel1_cut_items)) 
            {
                                    // move items in database
              var on_click_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'show_tree\', \'T0_a\', c_KEYB_MODE_NONE);";            
              this.db_obj.command({src_elem:this.panel1_cut_items, dst_elem:this.panel1_selected_items[0], old_parent_id:this.panel1_cut_items[0].parent_elem_id ,lock_id:uc_browsing_setup.tree_locked_item, cb_fctn_str:on_click_str}, "move_item"); 
                                    // any further paste operations are only copy operations
                                    // because the source items cannot be removed any more
              this.panel1_copied_items = this.panel1_cut_items;
              this.panel1_cut_items = [];             
            }
            else
              alert(c_LANG_WARNING_CYCLE_DETECTED[global_setup.curr_lang]);
          }
          else if (this.panel1_copied_items.length != 0)
          {
            if (!this.is_loop(this.panel1_selected_items[0], this.panel1_copied_items)) 
            {
                                    // copy items in database and reload tree
              var on_click_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'show_tree\', \'T0_a\', c_KEYB_MODE_NONE);";            
              this.db_obj.command({src_elem:this.panel1_copied_items, dst_elem:this.panel1_selected_items[0], lock_id:uc_browsing_setup.tree_locked_item, cb_fctn_str:on_click_str}, "copy_item"); 
            }
            else
              alert(c_LANG_WARNING_CYCLE_DETECTED[global_setup.curr_lang]);
          }
          else
            alert(c_LANG_WARNING_NOTHING_IN_MEMORY[global_setup.curr_lang]); 
        }
        else
          alert(c_LANG_WARNING_SINGLE_ITEM_NEEDED[global_setup.curr_lang]);        
        break;
        
    case "export_item" :
        if (this.panel1_selected_items.length == 1)
        {
          var my_url = window.location.protocol + "//" + window.location.host + window.location.pathname; 
          var my_php_path = my_url+'export_html.php?url=\"'+my_url+
                                            '\"&item_id=\"'+this.panel1_selected_items[0].elem_id+
                                            '\"&db_path=\"'+uc_browsing_setup.tree_data_src_path+
                                            '\"&db_type=\"'+uc_browsing_setup.tree_data_src_type+
                                          '\"&root_item=\"'+uc_browsing_setup.tree_data_src_params.root_item+
                                            '\"&db_name=\"'+uc_browsing_setup.tree_data_src_params.db_name+
                                           '\"&php_name=\"'+uc_browsing_setup.tree_data_src_params.php_name+'\"';
          window.open(my_php_path, 'X-Tree-M Export');
        }
        else
          alert(c_LANG_WARNING_SINGLE_ITEM_NEEDED[global_setup.curr_lang]);             
        break;
        
    case "lock_topic"  :
        if (this.panel1_selected_items.length==1) 
        {
                                    // unlock topic if it is locked for the second time
          if (this.panel1_selected_items[0].elem_id == uc_browsing_setup.tree_locked_item)
            uc_browsing_setup.tree_locked_item = uc_browsing_setup.tree_data_src_params.root_item;
          else  
            uc_browsing_setup.tree_locked_item = this.panel1_selected_items[0].elem_id;
          this.save_setup();
                                    // redraw tree
          var on_click_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'show_tree\', \'T0_a\', c_KEYB_MODE_NONE);";            
          this.db_obj.command({elemId:[this.panel1_selected_items[0].elem_id], lock_id:uc_browsing_setup.tree_locked_item, favIds:[], tickerIds:[], cb_fct_call:on_click_str, mode:"tree_only"}, "req_tree");
//          this.panel1_selected_items = []; 
//          this.panel1_selected_items[0] = this.tree_panel.get_item_data("T0");
//          this.panel1_select_idx = 1;
        }
        else
          alert(c_LANG_WARNING_SINGLE_ITEM_NEEDED[global_setup.curr_lang]);      
        break;
    case "as_news"     :
        if (this.panel1_selected_items.length==1) 
        {
          uc_browsing_setup.info_ticker1_item_id = this.panel1_selected_items[0].elem_id;
          this.save_setup();
          var req_tree_cb_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'ticker_only\', \'" + "T0_a\', c_KEYB_MODE_NONE);";            
          this.db_obj.command({elemId:[], lock_id:0, favIds:[], tickerIds:[uc_browsing_setup.info_ticker1_item_id, uc_browsing_setup.info_ticker2_item_id], cb_fct_call:req_tree_cb_str, mode:"ticker_only"}, "req_tree");
        }
        else
          alert(c_LANG_WARNING_SINGLE_ITEM_NEEDED[global_setup.curr_lang]);      
        break;
    case "as_date"     :
        if (this.panel1_selected_items.length==1) 
        {
          uc_browsing_setup.info_ticker2_item_id = this.panel1_selected_items[0].elem_id;
          this.save_setup();
          var req_tree_cb_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'ticker_only\', \'" + "T0_a\', c_KEYB_MODE_NONE);";            
          this.db_obj.command({elemId:[], lock_id:0, favIds:[], tickerIds:[uc_browsing_setup.info_ticker1_item_id, uc_browsing_setup.info_ticker2_item_id], cb_fct_call:req_tree_cb_str, mode:"ticker_only"}, "req_tree");
        }
        else
          alert(c_LANG_WARNING_SINGLE_ITEM_NEEDED[global_setup.curr_lang]);      
        break;
    default : 
      alert(c_LANG_UC_BROWSING_MSG_UNKNOWN_COMMAND[global_setup.curr_lang] + item);
    break;
  }
//  alert(item);
}


function uc_browsing_dispatcher_process_type_menu(item)
{
  // choose element type
  var item_int = lib_tree_get_type_no(item);
  if (item_int >= 0)
  {                                                  
                                    // set type in Info Bar
    this.toolbar.set_elem_type(item_int);
                                    // set new type for all selected items
    if (this.panel1_selected_items.length > 0)
    {
                                    // change type field in database
                                    // create item in database
      var on_click_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'show_tree\', \'T0_a\', c_KEYB_MODE_NONE);";            
      this.db_obj.command({items:this.panel1_selected_items, field_id:"type", content:c_LANG_LIB_TREE_ELEMTYPE[item_int+1][0], lock_id:uc_browsing_setup.tree_locked_item, cb_fctn_str:on_click_str}, "change_item_field");
    }
    this.panel1_elem_type = item_int;
  }
  else
    alert(c_LANG_UC_BROWSING_MSG_UNKNOWN_ELEM_TYPE[global_setup.curr_lang]);
}


function uc_browsing_dispatcher_process_fav_menu(item)                             
{
  switch (item)
  {
    // save currently selected tree item as favorite
    case c_LANG_UC_BROWSING_MENUBAR[2][1][0] :
      if (this.panel1_selected_items.length==1) 
      {
                                        // save currently selected item to last index of favorite item array
        uc_browsing_setup.favorites[uc_browsing_setup.favorites.length] = this.panel1_selected_items[0].elem_id;
                                        // write this setup into Setups Memory
        this.save_setup();
                                        // load favorites in respective panel
        var req_tree_cb_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'fav_only\', \'" + "T0_a\', c_KEYB_MODE_NONE);";            
        this.db_obj.command({elemId:[], lock_id:0, favIds:uc_browsing_setup.favorites, tickerIds:[], cb_fct_call:req_tree_cb_str, mode:"fav_only"}, "req_tree");
      }
      else
        alert(c_LANG_WARNING_WRONG_SELECTION[global_setup.curr_lang]);  
    break;
    
    // load currently selected favorite as selected tree item
    case c_LANG_UC_BROWSING_MENUBAR[2][2][0] :
      if (this.curr_sel_favorite_id!=-1) 
      {
        uc_browsing_setup.tree_last_selected = uc_browsing_setup.favorites[this.curr_sel_favorite_id];
        var req_tree_cb_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'show_tree\', \'T0_a\', c_KEYB_MODE_NONE);";            
        this.db_obj.command({elemId:[uc_browsing_setup.tree_last_selected], lock_id:uc_browsing_setup.tree_data_src_params.root_item, favIds:[], tickerIds:[], cb_fct_call:req_tree_cb_str, mode:"tree_only"}, "req_tree"); 
      }
      else
        alert(c_LANG_WARNING_WRONG_SELECTION[global_setup.curr_lang]);  
    break;
    
    // delete currently selected favorite
    case c_LANG_UC_BROWSING_MENUBAR[2][3][0] :
      if (this.curr_sel_favorite_id!=-1) 
      {
                                    // delete element from list
        uc_browsing_setup.favorites.splice(this.curr_sel_favorite_id, 1);
                                    // write list to cookies
        this.save_setup();
                                    // update internal variables
        this.curr_sel_favorite_id = -1;
                                    // change GUI accordingly
        var req_tree_cb_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'fav_only\', \'" + "T0_a\', c_KEYB_MODE_NONE);";            
        this.db_obj.command({elemId:[], lock_id:0, favIds:uc_browsing_setup.favorites, tickerIds:[], cb_fct_call:req_tree_cb_str, mode:"fav_only"}, "req_tree");
      }
      else
        alert(c_LANG_WARNING_WRONG_SELECTION[curr_lang]);  
    break;

    // delete all favorites
    case c_LANG_UC_BROWSING_MENUBAR[2][4][0] :
                                    // delete element from list
      uc_browsing_setup.favorites = [];
                                    // write list to cookies
      this.save_setup();
                                    // update internal variables
      this.curr_sel_favorite_id = -1;
                                    // change GUI accordingly
      var req_tree_cb_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'fav_only\', \'" + "T0_a\', c_KEYB_MODE_NONE);";            
      this.db_obj.command({elemId:[], lock_id:0, favIds:uc_browsing_setup.favorites, tickerIds:[], cb_fct_call:req_tree_cb_str, mode:"fav_only"}, "req_tree");
    break;
  }
  
//  alert(item);
}


function uc_browsing_dispatcher_keyb_proc(my_key, my_extra_keys, e)
{
  this.dbg_log.add_entry({module:"uc_brow_disp_keyb_proc", sub_function:my_key, side_condition:my_extra_keys, action:e.originalEvent.type});

  // check for too long inputs in tree panel
  if (this.text_focus == 1)
  {
    var my_item = null;
    if (this.panel1_new_tree_item_input == true)
    {
                                    // get new name from lib_tree
      my_item = document.getElementById("N0_input");
    }
    if (this.panel1_saved_rename_item != null)
    {
      my_item = document.getElementById(this.panel1_saved_rename_item.gui_id + "_input");
    }
    if (my_item != null)
    {
      var my_name = htmlEntities(my_item.value);
      if (my_name.length > c_DEFAULT_GLOBAL_SETUP.tree_item_max_letters)
      {
        my_item.style.color = "red";
      }
      else
      {
        my_item.style.color = "black";
      }
    }
  }  
                                    // ... otherwise use these options
  switch (my_extra_keys)
  {
    // No extra key
    case c_KEYB_MODE_NONE :
        
        switch (my_key)
        {
//          // TAB - shift items one level down (1st child)
//          case 9 :
//            //alert("Tab");
//                                    // cut selected items
//            this.process_elem_menu("cut_item");
//                                    // grab 1st child's GUI ID ...
//            var mychildren_gui_id = lib_tree_get_children(this.panel1_cut_items[0].gui_id);
//            this.panel1_selected_items = [];
//            this.panel1_selected_items[0] = this.tree_panel.get_item_data(mychildren_gui_id[0]);
//                                    // ... and paste them
//            this.process_elem_menu("paste_item");
//          break;
          
          // ENTER
          case 13 :
            //alert("Enter");
            if ((this.panel1_new_tree_item_input == true) || (this.panel1_saved_rename_item != null))
            {
              this.text_focus = 0;
              this.clicked_at("enter_key", "", "input_done", c_KEYB_MODE_NONE);
            }
          break;

          // ESC
          case 27 :
            //alert("ESC");
            if ((this.panel1_new_tree_item_input == true) || (this.panel1_saved_rename_item != null))
            {
              this.text_focus = 0;            
              this.clicked_at("esc_key", "", "cancel_item", c_KEYB_MODE_NONE);
            }
          break;

          // F2
          case 113 :
            //alert("F2");
            if (this.text_focus == 0)
            {
              this.clicked_at("menubar", c_LANG_UC_BROWSING_MENUBAR[0][0][0], "change_item", c_KEYB_MODE_NONE);            
            }
          break;
    
          // DEL
          case 46 :
            //alert("DEL");
            if (this.text_focus == 0)
              this.clicked_at("menubar", c_LANG_UC_BROWSING_MENUBAR[0][0][0], "delete_item", c_KEYB_MODE_NONE);
          break;
          
          // arrow left
          case 37 :
            if (this.text_focus == 0)
            {
              e.preventDefault();
              var curr_ul = document.getElementById(this.panel1_selected_items[0].gui_id + '_ul');
              curr_ul.style.display="none";
            }
          break;

          // arrow up
          case 38 : 
            if (this.text_focus == 0)
            {
              e.preventDefault();
                                    // unmark all selected items
              var new_selected_gui_id = this.tree_panel.get_next_visible_up(this.panel1_selected_items[0].gui_id);  
              if (new_selected_gui_id != null)
              {
                for (var i=0; i<this.panel1_selected_items.length; i++)
                  this.tree_panel.markup_items(this.panel1_selected_items[i].gui_id, false);

                this.panel1_selected_items = [];
                                    // renew selection
                this.panel1_selected_items[0] = this.tree_panel.get_item_data(new_selected_gui_id);
                this.tree_panel.markup_items(this.panel1_selected_items[0].gui_id, true);                                                             
                                    // save setup
                uc_browsing_setup.tree_last_selected = this.panel1_selected_items[0].elem_id;
                this.save_setup();                
                                    // scroll into view
                document.getElementById(this.panel1_selected_items[0].gui_id + '_div').scrollIntoView();  // $$$
                                    // load content
                this.content_panel.load_item_content(this.tree_panel.get_item_data(this.tree_panel.get_gui_id(uc_browsing_setup.tree_last_selected)[0]));                                    
              }
              else
              {
                this.select_item("tree_select", "E0", c_KEYB_MODE_NONE)
                document.getElementById('div_panel1_content').scrollTop = 0;
              }
              window.scrollTo(0, 0);              
            }
          break;
           
          // arrow right
          case 39 :
            if (this.text_focus == 0)
            {
              e.preventDefault();
              var curr_ul = document.getElementById(this.panel1_selected_items[0].gui_id + '_ul');
              curr_ul.style.display="block";
            }
          break;
              
          // arrow down
          case 40 : 
            if (this.text_focus == 0)
            {
              e.preventDefault();

              var new_selected_gui_id = this.tree_panel.get_next_visible_dn(this.panel1_selected_items[0].gui_id);  
              if (new_selected_gui_id != null)
              {
                                    // unmark all selected items
                for (var i=0; i<this.panel1_selected_items.length; i++)
                  this.tree_panel.markup_items(this.panel1_selected_items[i].gui_id, false);
                
                this.panel1_selected_items = [];
                                    // renew selection
                this.panel1_selected_items[0] = this.tree_panel.get_item_data(new_selected_gui_id);
                this.tree_panel.markup_items(this.panel1_selected_items[0].gui_id, true);                                                             
                                    // save setup
                uc_browsing_setup.tree_last_selected = this.panel1_selected_items[0].elem_id;
                this.save_setup();                
                                    // scroll into view
                document.getElementById(this.panel1_selected_items[0].gui_id + '_div').scrollIntoView();  // $$$              
                                    // load content
                this.content_panel.load_item_content(this.tree_panel.get_item_data(this.tree_panel.get_gui_id(uc_browsing_setup.tree_last_selected)[0]));
              }
              window.scrollTo(0, 0);
            }
          break;
  
          
          default : 
            break;
        }
    break;  // No extra key


    // CTRL
    case c_KEYB_MODE_CTRL_ONLY :
      if (this.text_focus == 0)
      {
        switch (my_key)
        {
          // CTRL + C
          case 67 : 
            //alert("CTRL-C");
            this.clicked_at("menubar", c_LANG_UC_BROWSING_MENUBAR[0][0][0], "clone_item", c_KEYB_MODE_CTRL_ONLY);
          break; 
          
          // CTRL + L
          case 76 :
            //alert("CTRL-L");
            this.clicked_at("menubar", c_LANG_UC_BROWSING_MENUBAR[0][0][0], "copy_item", c_KEYB_MODE_CTRL_ONLY);
          break;

          // CTRL + V
          case 86 :
            //alert("CTRL-V");
            this.clicked_at("menubar", c_LANG_UC_BROWSING_MENUBAR[0][0][0], "paste_item", c_KEYB_MODE_CTRL_ONLY);
          break;
          
          // CTRL + X
          case 88 :
            //alert("CTRL-X");
            this.clicked_at("menubar", c_LANG_UC_BROWSING_MENUBAR[0][0][0], "cut_item", c_KEYB_MODE_CTRL_ONLY);
          break;

          default : break;
        }
      }  
    break; // CTRL

    // SHIFT
    case c_KEYB_MODE_SHIFT_ONLY :
      if (this.text_focus == 0)
      {
        switch (my_key)
        {
          // TAB - shift item(s) one level up
          case 9 :
            //alert("ShiftTab");
                                    // cut selected items
            this.process_elem_menu("cut_item");
            this.panel1_selected_items = [];
            var myParent_obj;
            if (this.panel1_cut_items[0].parent_gui_id != null)
            {
              myParent_obj = this.tree_panel.get_item_data(this.panel1_cut_items[0].parent_gui_id);
              if (myParent_obj.parent_gui_id != null)
              {
                this.panel1_selected_items[0] = this.tree_panel.get_item_data(myParent_obj.parent_gui_id);
                                    // ... and paste them at grandparent
                this.process_elem_menu("paste_item");
                this.panel1_selected_items_afterop = jQuery.extend(true, [], this.panel1_cut_items);
              }
            }
          break;

          default :
          break;          
        }
      }
    break; // SHIFT

    // ALT
    case c_KEYB_MODE_ALT_ONLY :
      if (this.text_focus == 0)
      {
        switch (my_key)
        {
          // ALT + N          
          case 78 :
            //alert("ALT-N");
            if (this.text_focus == 0)  
            {
              this.clicked_at("menubar", c_LANG_UC_BROWSING_MENUBAR[0][0][0], "input_item", c_KEYB_MODE_ALT_ONLY);            
            }
          break;
          
          // ALT + 0..9
          default :
            if(my_key>47 && my_key<58)
            { 
              //alert("ALT-"+(my_key-48));        
              this.clicked_at("menubar", c_LANG_LIB_TREE_ELEMTYPE[0][0], new String(c_LANG_LIB_TREE_ELEMTYPE[my_key-47][0]), c_KEYB_MODE_ALT_ONLY);  
            }
          break;
        }
      }
    break; // ALT
      
      
    // CTRL + Shift + ALT
    case c_KEYB_MODE_ALT_SHIFT_CTRL :
      if (this.text_focus == 0)
      {
        switch (my_key)
        {
          // CTRL+Shift+ALT + E
          case 69 :
            //alert("CTRL+Shift+ALT-E");
            this.clicked_at("menubar", c_LANG_UC_BROWSING_MENUBAR[0][0][0], "export_item", c_KEYB_MODE_ALT_SHIFT_CTRL);               
          break;

          // CTRL+Shift+ALT + L
          case 76 :
            //alert("CTRL+Shift+ALT+L");
            this.clicked_at("menubar", c_LANG_UC_BROWSING_MENUBAR[0][0][0], "lock_topic", c_KEYB_MODE_ALT_SHIFT_CTRL);               
          break; 
        
          default : break;            
        }
      }  
    break; // CTRL + Shift + ALT    
  }
    
//  alert(my_key);  
}


function uc_browsing_dispatcher_create_db(iparams)  // {start_elem_id}
{
                                        // create new database object
  this.db_obj = new lib_data_dispatcher(this.def_parent_storage, uc_browsing_setup.tree_data_src_type, uc_browsing_setup.tree_data_src_path, uc_browsing_setup.tree_data_src_params, global_setup);                                            
  this.content_panel.set_db(this.db_obj);
//  this.db_html_export = new lib_data_dispatcher(this.def_parent_storage, c_DATA_SOURCE_TYPE_ID_HTML, "local", {db_name:"uc_browsing_tree_db_html.xml", php_name:"uc_browsing_html_export.php", root_item:"root"});                                              
                                        // reload tree
  var req_tree_cb_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'load_all\', \'" + "T0_a\', c_KEYB_MODE_NONE);";            
  this.db_obj.command({elemId:[iparams.start_elem_id], lock_id:uc_browsing_setup.tree_locked_item, favIds:uc_browsing_setup.favorites, tickerIds:[uc_browsing_setup.info_ticker1_item_id, uc_browsing_setup.info_ticker2_item_id], cb_fct_call:req_tree_cb_str, mode:"load_all"}, "req_tree");
}                            


function uc_browsing_dispatcher_clicked_at(sender, submodule, item, mode)
{
  this.dbg_log.add_entry({module:"uc_browsing_disp_clicked_at", sender:sender, submodule:submodule, item:item, mode:mode});
  
  switch (sender)
  {
    case "menubar" :
    
        switch (submodule)
        { 
          case c_LANG_UC_BROWSING_MENUBAR[0][0][0] : //  c_LANG_UC_BROWSING_MENUBAR[0][0][0] :   // elem_menu
              this.process_elem_menu(item);
              break;
          case c_LANG_UC_BROWSING_MENUBAR[1][0][0] : // type_menu
              this.process_type_menu(item);
              break;
          case c_LANG_UC_BROWSING_MENUBAR[2][0][0] : // fav_menu
              this.process_fav_menu(item);
              break;          
          case c_LANG_UC_BROWSING_MENUBAR[3][1][0][0] : // setup_menu.lang_menu
              global_setup.curr_lang = parseInt(item) + 1;
              global_dispatcher_save_setup();
              this.lang_change();
              break;          
          case c_LANG_UC_BROWSING_MENUBAR[3][2][0][0] : // setup_menu.db_type
              switch (item)
              {
                case "0" : // XML at same URL as 
                  uc_browsing_setup.tree_data_src_type = c_DATA_SOURCE_TYPE_ID_XML;
                  uc_browsing_setup.tree_data_src_path = "local";
                  uc_browsing_setup.tree_data_src_params.root_item = "root";
                  // alert("XML LOCAL");
                  break;
//                case "1" : 
//                  uc_browsing_setup.tree_data_src_type = c_DATA_SOURCE_TYPE_ID_XML;
//                  uc_browsing_setup.tree_data_src_path = "local";
//                  uc_browsing_setup.tree_data_src_params.root_item = "root";
///                  // alert("XML WWW");
//                  break;
                default :               
                  uc_browsing_setup.tree_data_src_type = c_DATA_SOURCE_TYPE_ID_DISCO;
                  uc_browsing_setup.tree_data_src_path = "test.disco-network.org/api/odata";
                  uc_browsing_setup.tree_data_src_params.root_item = "1";
                  // alert("DISCO");
                  break;
              }
                                        // save new setup
              uc_browsing_setup.tree_locked_item = uc_browsing_setup.tree_data_src_params.root_item;
              uc_browsing_setup.tree_last_selected = uc_browsing_setup.tree_data_src_params.root_item;
              uc_browsing_setup.favorites = [];
              uc_browsing_setup.info_ticker1_item_id = null;
              uc_browsing_setup.info_ticker2_item_id = null;
              this.save_setup();              
                                        // create new database
              this.create_db({start_elem_id:uc_browsing_setup.tree_data_src_params.root_item})
              
              break;
          case c_LANG_UC_BROWSING_MENUBAR[3][3][0][0] : // setup_menu.disp_type
                // alert("Display_Type");
                global_setup.display_type = parseInt(item);
                global_dispatcher_save_setup();               
                this.switch_display(global_setup.display_type);                
              break; 
          case c_LANG_UC_BROWSING_MENUBAR[4][0][0] : // help_menu
              switch (item)
              {
                case "erase_cookies" :
                  uc_browsing_setup = jQuery.extend(true, {}, c_DEFAULT_UC_BROWSING_SETUP);
                  this.save_setup();
                  global_setup = jQuery.extend(true, {}, c_DEFAULT_GLOBAL_SETUP);
                  global_dispatcher_save_setup();
                break;
                case "send_err_log" :
                  this.dbg_log.create_email();
                break;
                case "display_hint" :
                  alert(c_LANG_UC_BROWSING_HELP_HINTS[global_setup.curr_lang]);
                break;
                case "source_code" :
                  window.open('https://github.com/samohtred/htdocs', 'X-Tree-M Source Code');                  
                break; 
                case "display_version" :
                  alert(plugin_name + '\n ' + '\n' + c_LANG_UC_BROWSING_HELP_VERSION[global_setup.curr_lang] + plugin_version + '\n' + c_LANG_UC_BROWSING_HELP_CREATED[global_setup.curr_lang] + plugin_date);
                break;
                default :              
                  alert(c_LANG_UC_BROWSING_MSG_UNKNOWN_COMMAND[global_setup.curr_lang] + item);                  
                break;
              }
              break;          
          default :
              alert(c_LANG_UC_BROWSING_MSG_UNKNOWN_SUBMODULE[global_setup.curr_lang] + submodule);
          break;
        }
    break;
    
    case "enter_key" :
        if (this.panel1_new_tree_item_input == true)
        {
                                    // get new name from lib_tree and limit number of letters
          var item_name = htmlEntities(document.getElementById("N0_input").value);
          item_name = item_name.substring(0, c_DEFAULT_GLOBAL_SETUP.tree_item_max_letters);
                                    // clear flag
          this.panel1_new_tree_item_input = false;
                                    // create item in database
          var on_click_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'show_tree\', \'T0_a\', c_KEYB_MODE_NONE);";            
          this.db_obj.command({parent_elem_id:this.panel1_selected_items[0].elem_id, name:item_name, type:c_LANG_LIB_TREE_ELEMTYPE[this.panel1_elem_type+1][0], lock_id:uc_browsing_setup.tree_locked_item, cb_fctn_str:on_click_str}, "create_item");
        }
        if (this.panel1_saved_rename_item != null)
        {
                                    // get new name from lib_tree and limit number of letters
          var item_name = htmlEntities(document.getElementById(this.panel1_saved_rename_item.gui_id + "_input").value);
          item_name = item_name.substring(0, c_DEFAULT_GLOBAL_SETUP.tree_item_max_letters);
                                    // clear flag
          this.panel1_saved_rename_item = null;
                                    // create item in database
          var on_click_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'show_tree\', \'T0_a\', c_KEYB_MODE_NONE);";            
          this.db_obj.command({items:this.panel1_selected_items, field_id:"name", content:item_name, lock_id:uc_browsing_setup.tree_locked_item, cb_fctn_str:on_click_str}, "change_item_field");
        }
        break;

    case "esc_key" :
        if (this.panel1_new_tree_item_input == true)
        {
                                    // remove newly created gui item
          var item_to_clear = document.getElementById("N0_li");
          item_to_clear.parentNode.removeChild(item_to_clear);
                                    // clear flag
          this.panel1_new_tree_item_input = false;
        }
        if (this.panel1_saved_rename_item != null)
        {
                                    // reload tree from database
          this.select_by_id(this.panel1_selected_items[0].elem_id)                                    
                                    // clear flag
          this.panel1_saved_rename_item = null;
        }
        break;
    
    case "panel1" :
                                    // extract GUI ID
        var gui_id = item.substring(0, item.indexOf("_a"));

        switch (submodule)
        {
                                    // normal element selection in Explorer Path or Tree
          case "explorer_select" :
          case "tree_select" :      
            this.select_item(submodule, gui_id, mode);
          break;
                                    // init of tree, content, info panel and feature panel
          case "load_all" :
                                    // get data from database module
            var curr_tree_data = this.db_obj.command({}, "get_tree");                                    
                                    // init info panel and set periodic timer
            this.info_panel = new uc_browsing_infopanel("div_panel3_headline", c_LANG_UC_BROWSING_PANEL3_TITLE, "div_panel3_pad", "uc_browsing", "panel3", this.cb_clicked_at_str, curr_tree_data.ticker); 
            var on_click_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel3\', \'update_info_panel\', \'disp_init\', c_KEYB_MODE_NONE);";
            setTimeout(on_click_str, uc_browsing_setup.info_timer); 
                                    // init features panel
            this.features_panel = new uc_browsing_features("div_panel4_headline", c_LANG_UC_BROWSING_PANEL4_TITLE, "div_panel4_pad", "uc_browsing", "panel4", this.cb_clicked_at_str, this.db_obj);
            this.features_panel.load_favorites(curr_tree_data.fav);
          case "show_tree" :
            if (this.panel1_selected_items_afterop.length != 0)
            {
              this.select_by_id(this.panel1_selected_items_afterop[0].elem_id);  
              this.panel1_selected_items_afterop = [];
            }
            else
              this.select_by_id(uc_browsing_setup.tree_last_selected);  
            this.toolbar.set_cb_url(uc_browsing_setup.tree_last_selected);       
          break; 
          case "ticker_only" :
            var curr_tree_data = this.db_obj.command({}, "get_tree");
            this.info_panel.init_gui(curr_tree_data.ticker);
          break;
          case "fav_only" :
                                    // get data from db module
            var curr_tree_data = this.db_obj.command({}, "get_tree");
                                    // extract array to save Cookie
            for (var i=0; i<curr_tree_data.fav.length; i++)
              uc_browsing_setup.favorites[i] = curr_tree_data.fav[i][0].elem_id;
            this.save_setup();
            this.features_panel.load_favorites(curr_tree_data.fav);
          break;
                                    // request parents from database to prepare parent menu
          case "open_parent_menu" :
            this.panel1_selected_items[0]=this.tree_panel.get_item_data(gui_id);
            this.panel1_select_idx = 1;
            var myself = this.tree_panel.get_item_data(gui_id);
            var on_click_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'show_parent_menu\', \'\', c_KEYB_MODE_NONE);";            
            this.db_obj.command({elem_id:myself.elem_id, cb_fctn_str:on_click_str}, "req_all_parents");
          break;
                                    // open up Menu to choose desired parent node after clicking {...} button
          case "show_parent_menu" : 
            var gui_obj_list = this.db_obj.command({}, "get_all_parents");
            this.tree_panel.print_multi_parent_menu(gui_obj_list);
          break;
          
          case "parent_menu_select" :
            this.select_parent(gui_id);
          break;
            
          case "switch_disp" :
            if (global_setup.display_type == 0)
              global_setup.display_type = 1;
            else
              global_setup.display_type = 0;
            global_dispatcher_save_setup();               
            this.switch_display(global_setup.display_type);
          break; 
            
          default :
            alert(c_LANG_UC_BROWSING_MSG_UNKNOWN_SUBMODULE[global_setup.curr_lang] + submodule);
        }
    break;

    case "panel2" :
        switch (submodule)
        {
          case "content" :
              if (item == "on_focus")
              {
                                    // if new item or change item command still active :
                                    // fire cancel to it
                if (this.text_focus != 0)
                {
                  this.clicked_at("esc_key", "", "cancel_item", c_KEYB_MODE_NONE);
                }
                this.text_focus = 1;
              }
              if (item == "on_blur")
              {
                this.text_focus = 0;
                                    // save text content to database
                var on_click_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'show_tree\', \'T0_a\', c_KEYB_MODE_NONE);";            
// URL-Ersetzung : -> Problem : Text-Box nicht HTML-f�hig !!!
                this.db_obj.command({items:this.panel1_selected_items, field_id:"content", content:URLlinks(getInnerHTML(document.getElementById("panel2_content_fulltext"))), lock_id:uc_browsing_setup.tree_locked_item, cb_fctn_str:on_click_str}, "change_item_field");
//                this.db_obj.command({items:this.panel1_selected_items, field_id:"content", content:URLlinks(nl2br(getInnerHTML(document.getElementById("panel2_content_fulltext")))), lock_id:uc_browsing_setup.tree_locked_item, cb_fctn_str:on_click_str}, "change_item_field");                
//                this.db_obj.command({items:this.panel1_selected_items, field_id:"content", content:getInnerHTML(document.getElementById("panel2_content_fulltext")), lock_id:uc_browsing_setup.tree_locked_item, cb_fctn_str:on_click_str}, "change_item_field");                
              }                
              
          break;
        }
    break;

    case "panel3" :
        switch (submodule)
        {
          case "ticker_item_link" :
              this.select_by_id(item);
              break;
          case "update_info_panel" :
              this.update_info_panel(item);
              break;
        }
    break;

    case "panel4" :
        switch (submodule)
        {
          case "favorites" :
              this.curr_sel_favorite_id = parseInt(item);
              if (mode == c_KEYB_MODE_CTRL_ONLY)
              {
                this.process_fav_menu(c_LANG_UC_BROWSING_MENUBAR[2][2][0]);
              }
              else
              {

                for (var i=0; i<uc_browsing_setup.favorites.length; i++)
                {
                  if (i==this.curr_sel_favorite_id) 
                    document.getElementById('favorite' + i + '_div').style.backgroundColor = '#C0C0F0';
                  else
                    document.getElementById('favorite' + i + '_div').style.backgroundColor = 'transparent';
                }
              }  
              break;        
        }
    break;
    
    default :
        alert(c_LANG_UC_BROWSING_MSG_UNKNOWN_SENDER[global_setup.curr_lang] + sender);
    break;
  }
}


function uc_browsing_dispatcher_switch_display(selection)
{
  var curr_tree_part = this.db_obj.command({}, "get_tree");
  this.tree_panel.print_tree(curr_tree_part, this.panel1_selected_items[0].elem_id);  
}


function uc_browsing_dispatcher_update_info_panel(source)
{
//  alert(source);
                                    // request data from database 
  var req_tree_cb_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'ticker_only\', \'" + "T0_a\', c_KEYB_MODE_NONE);";            
  this.db_obj.command({elemId:[], lock_id:0, favIds:[], tickerIds:[uc_browsing_setup.info_ticker1_item_id, uc_browsing_setup.info_ticker2_item_id], cb_fct_call:req_tree_cb_str, mode:"ticker_only"}, "req_tree");
                                    // setup next automatic timer for Info Panel
  var on_click_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel3\', \'update_info_panel\', \'update_info_panel\', c_KEYB_MODE_NONE);";
  setTimeout(on_click_str, uc_browsing_setup.info_timer);     
}


function uc_browsing_dispatcher_load_setup()
{
  if (global_status.global_setup_loaded == true)
  {
    switch (global_status.actual_setup_src_type)
    {
      case c_DATA_SOURCE_TYPE_ID_COOKIE :
            var setup_cookie = new lib_data_cookie(plugin_name, this.my_path, c_DEFAULT_UC_BROWSING_SETUP_COOKIE);
            var my_cookie_content = setup_cookie.read("data");
            if (my_cookie_content != null)
            {
              uc_browsing_setup.tree_last_selected    = my_cookie_content.tree_last_selected  ;
              uc_browsing_setup.tree_locked_item      = my_cookie_content.tree_locked_item    ; 
              uc_browsing_setup.info_ticker1_item_id  = my_cookie_content.info_ticker1_item_id;
              uc_browsing_setup.info_ticker2_item_id  = my_cookie_content.info_ticker2_item_id;
              uc_browsing_setup.favorites             = my_cookie_content.favorites;
            }
            else
              alert(c_LANG_UC_BROWSING_MSG_SETUP_LOADING_FAILED[global_setup.curr_lang]);
          break;
      default :
          break;
    }
  }
  if (param_item_id != undefined)
    uc_browsing_setup.tree_last_selected = param_item_id;
}


function uc_browsing_dispatcher_save_setup()
{
  if (global_status.global_setup_loaded == true)
  {
    switch (global_status.actual_setup_src_type)
    {
      case c_DATA_SOURCE_TYPE_ID_COOKIE :
            var setup_cookie = new lib_data_cookie(plugin_name, this.my_path, c_DEFAULT_UC_BROWSING_SETUP_COOKIE);
            setup_cookie.write("data", uc_browsing_setup);
          break;
      default :
          break;
    }
  }
}


function uc_browsing_dispatcher_init()
{
  this.dbg_log = new lib_dbg_log();
                                    // get Sub-Directory name of instance and delete all slashes
  var my_path_raw = window.location.pathname;
  this.my_path = my_path_raw.replace(/\//g,''); 
  
  // load setup into struct 'uc_browsing_setup'
  this.load_setup();
  // prepare data sources (default parents and discussion content)
  this.def_parent_storage = new lib_data_cookie("X-Tree-M", this.my_path, "Default_Parents");
//$$$  this.db_obj = new lib_data_dispatcher(this.def_parent_storage, uc_browsing_setup.tree_data_src_type, uc_browsing_setup.tree_data_src_path, uc_browsing_setup.tree_data_src_params);
  // load Menu and Tool Bar                                                  
  this.menubar = new uc_browsing_menubar( 'div_menubar', 'uc_browsing', 'menubar', this.cb_clicked_at_str, c_LANG_UC_BROWSING_MENUBAR); 
  this.toolbar = new uc_browsing_toolbar( 'div_toolbar', this.cb_clicked_at_str);     
  // load Panel 1
                                    // init content panel
  this.content_panel = new uc_browsing_content("div_panel2_headline", c_LANG_UC_BROWSING_PANEL2_TITLE, "div_panel2_pad", "uc_browsing", "panel2", this.cb_clicked_at_str, this.db_obj);
                                    // load tree panel, info panel and features panel  
  this.tree_panel = new lib_tree("div_panel1_headline", c_LANG_UC_BROWSING_MENUBAR[3][3][1], "div_panel1_pad", "uc_browsing", "panel1", this.cb_clicked_at_str);

//$$$  var req_tree_cb_str = "window." + this.cb_clicked_at_str + "(\'uc_browsing\', \'panel1\', \'load_all\', \'" + "T0_a\', c_KEYB_MODE_NONE);";            
//$$$  this.db_obj.command({elemId:[uc_browsing_setup.tree_last_selected], lock_id:uc_browsing_setup.tree_locked_item, favIds:uc_browsing_setup.favorites, tickerIds:[uc_browsing_setup.info_ticker1_item_id, uc_browsing_setup.info_ticker2_item_id], cb_fct_call:req_tree_cb_str, mode:"load_all"}, "req_tree");

}

