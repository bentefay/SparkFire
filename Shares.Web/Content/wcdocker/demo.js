/*
  Welcome to the Demo for the Web Cabin Docker!
*/
$(document).ready(function() {
  // --------------------------------------------------------------------------------
  // Create an instance of our docker window and assign it to the document.
  var myDocker = new wcDocker('.dockerContainer');
  if (myDocker) {

    var _currentTheme = 'Default';
    var _showingInfo  = true;
    var _savedLayout  = null;
    var _chatterIndex = 1;

    // A common function that uses the 'Info Panel' to show a given block of text.
    function showInfo(text) {
      var infoPanel = myDocker.addPanel('Info Panel', wcDocker.DOCK_MODAL);
      infoPanel.layout().scene().find('span').text(text);
    }

    // --------------------------------------------------------------------------------
    // Register the info panel, this is a popup modal dialog panel that displays custom
    // information about a given panel type.  Note that this panel is marked as
    // 'isPrivate', which means the user will not get the option to create more of these.
    myDocker.registerPanelType('Info Panel', {
      isPrivate: true,
      onCreate: function(myPanel) {
        myPanel.initSize(400, 200);
        var $infoText = $('<span class="info" style="position:absolute;top:0px;left:0px;right:0px;bottom:30px;margin:20px;"></span>');
        var $buttonTray = $('<div style="position:absolute;left:0px;right:0px;bottom:0px;margin:20px;text-align:right;"></div>')
        var $okButton = $('<button>OK</button>');
        $buttonTray.append($okButton);

        myPanel.layout().addItem($infoText);
        myPanel.layout().addItem($buttonTray, 1, 0);

        $okButton.click(function() {
          myPanel.close();
        });
      },
    });

    // --------------------------------------------------------------------------------
    // Register the top panel, this is the static panel at the top of the window
    // that can not be moved or adjusted.  Note that this panel is marked as
    // 'isPrivate', which means the user will not get the option to create more of these.
    myDocker.registerPanelType('Top Panel', {
      isPrivate: true,
      onCreate: function(myPanel) {
        myPanel.layout().scene().css('padding', '10px');

        // Constrain the sizing of this window so the user can't resize it.
        myPanel.initSize(Infinity, 120);
        myPanel.minSize(100, 120);
        myPanel.maxSize(Infinity, 120);
        myPanel.title(false);

        // Do not allow the user to move or remove this panel, this will remove the title bar completely from the frame.
        myPanel.moveable(false);
        myPanel.closeable(false);

        var $header = $('<div style="text-align:center;"><strong>Welcome to the Web Cabin Docker!</strong></div>');

        // Add some text information into the panel
        myPanel.layout().addItem($header, 0, 0);
        myPanel.layout().addItem($('<div style="text-align:center">Web Cabin Docker is a docking panel layout interface written in JavaScript under the <a href="http://www.opensource.org/licenses/mit-license.php">MIT License</a>.</div>'), 0, 1);
        myPanel.layout().addItem($('<div style="text-align:center">View the source here: <a href="https://github.com/WebCabin/wcDocker">https://github.com/WebCabin/wcDocker</a></div>'), 0, 2);
        myPanel.layout().addItem($('<div style="text-align:center">View the instructions and documentation here: <a href="https://github.com/WebCabin/wcDocker/wiki/Instructions">https://github.com/WebCabin/wcDocker/wiki/Instructions</a></div>'), 0, 3);
      }
    });

    // --------------------------------------------------------------------------------
    // Register the control panel, this one has a few controls that allow you to change
    // dockers theme as well as layout configuration controls.
    myDocker.registerPanelType('Control Panel', {
      faicon: 'gears',
      onCreate: function(myPanel) {
        myPanel.initSize(500, 300);
        myPanel.layout().scene().css('padding', '10px');

        // Create our theme dropdown menu.
        var $themeLabel       = $('<div style="width:100%;text-align:right;margin-top:20px;white-space:nowrap;">Select theme: </div>');
        var $themeSelector    = $('<select class="themeSelector" style="margin-top:20px;width:100%">');
        $themeSelector.append('<option value="Default">Default</option>');
        $themeSelector.append('<option value="bigRed">Big Red</option>');
        $themeSelector.append('<option value="shadow">Shadow</option>');
        $themeSelector.val(_currentTheme);

        // Pre-configured layout configurations.
        var $saveButton       = $('<button style="width:100%;">Save Layout</button>');
        var $loadButton       = $('<button class="restoreButton" style="width:100%;">Restore Layout</button>');
        if (!_savedLayout) {
          $loadButton.attr('disabled', true);
        }

        myPanel.layout().startBatch();
        myPanel.layout().addItem($themeLabel, 0, 1).css('text-align', 'right').css('width', '1%');
        myPanel.layout().addItem($themeSelector, 1, 1).css('text-align', 'left');

        myPanel.layout().addItem('<div style="height: 20px;"></div>', 0, 2, 2, 1);
        myPanel.layout().addItem($saveButton, 0, 4, 2, 1);
        myPanel.layout().addItem($loadButton, 0, 5, 2, 1);
        myPanel.layout().finishBatch();

        // Here we do some css table magic to make all other cells align to the top of the window.
        // The returned element from addItem is always the <td> of the table, its' parent is the <tr>
        myPanel.layout().addItem('<div>', 0, 10, 2, 1).parent().css('height', '100%');

        // Bind an event to catch when the theme has been changed.
        $themeSelector.change(function() {
          _currentTheme = $themeSelector.find('option:selected').val();

          // To load a theme, you just need to create a new 'link' element that includes the theme css file.
          // First we remove any already existing theme, so they don't conflict.
          $('#theme').remove();

          // The default theme requires no additional theme css file.
          if (_currentTheme !== 'Default') {
            var cacheBreak = (new Date()).getTime();
            $('head').append($('<link id="theme" rel="stylesheet" type="text/css" href="Themes/' + _currentTheme + '.css?v=' + cacheBreak + '"/>'));
          }

          // In case there are multiple control panels, make sure every theme selector are updated with the new theme.
          $('.themeSelector').each(function() {
            if (this !== $themeSelector[0]) {
              $(this).val(_currentTheme);
            }
          });
        });

        // Disable the restore layout button if there are no layouts to restore.
        // $restoreButton.attr('disabled', _savedLayouts.length? false: true);

        // Setup a click handler for the save button.
        var saveTimer = 0;
        $saveButton.click(function() {
          // Save the layout.
          _savedLayout = myDocker.save();

          // Enable all restore buttons on the page, as there may be more than one control panel open.
          $saveButton.html('<b>Layout Saved!</b>');
          $('.restoreButton').each(function() {
            $(this).attr('disabled', false);
          });

          // Notify the user that the layout is saved by changing the button text and restoring it after a time delay.
          if (saveTimer) {
            clearTimeout(saveTimer);
            saveTimer = 0;
          }
          saveTimer = setTimeout(function() {
            $saveButton.text('Save Layout');
            saveTimer = 0;
          }, 500);
        });

        // Restore a layout whenever a selection on the layout list is changed.
        $loadButton.click(function() {
          if (_savedLayout) {
            myDocker.restore(_savedLayout);
          }
        });

        // Create a panel button that shows information about this panel.
        myPanel.addButton('Info', 'fa fa-question', '?', 'Show information about this panel.');
        myPanel.on(wcDocker.EVENT_BUTTON, function(data) {
          // Use the preivously defined common function to popup the Info Panel.
          showInfo('The control panel demonstrates a few of the wcDocker-wide features available to you.  Try changing the theme or saving the current panel layout configuration and then restore it later.');
        });
      }
    });

    // --------------------------------------------------------------------------------
    // Register the widget panel, a demonstration of some of the built in
    // panel widget items.
    myDocker.registerPanelType('Widget Panel', {
      faicon: 'trophy',
      onCreate: function(myPanel) {
        myPanel.initSize(400, 400);
        // myPanel.layout().showGrid(true);
        myPanel.layout().scene().css('padding', '10px');

        // We need at least one element in the main layout that can hold the splitter.  We give it classes wcWide and wcTall
        // to size it to the full size of the panel.
        var $scene = $('<div style="width:100%;height:100%;position:relative;">');

        myPanel.layout().addItem($scene, 0, 0).css('border', '1px solid black').parent().css('height', '100%');


        // Here we can utilize the splitter used by wcDocker internally so that we may split up
        // a single panel.  Splitters can be nested, and new layouts can be created to fill
        // each side of the split.
        var splitter = new wcSplitter($scene, myPanel, wcDocker.ORIENTATION_VERTICAL);
        splitter.scrollable(0, false, false);
        splitter.scrollable(1, false, false);

        // Initialize this splitter with a layout in each pane.  This can be done manually, but
        // it is more convenient this way.
        splitter.initLayouts();

        // By default, the splitter splits down the middle, but the position can be assigned manually by giving it a percentage value from 0-1.
        splitter.pos(0.5);

        // Now create a second, nested, splitter to go inside the existing one.
        var $subScene = $('<div style="width:100%;height:100%;position:relative;">');
        splitter.pane(0).addItem($subScene);

        var subSplitter = new wcSplitter($subScene, myPanel, wcDocker.ORIENTATION_HORIZONTAL);
        subSplitter.initLayouts();
        subSplitter.pos(0.25);

        // Now create a tab widget and put that into one of the sub splits.
        var $tabArea = $('<div style="width:100%;height:100%;position:relative;">');
        subSplitter.pane(1).addItem($tabArea);
        var tabFrame = new wcTabFrame($tabArea, myPanel);
        tabFrame.addTab('Custom Tab 1').addItem($('<div class="info" style="border:2px solid black;margin:20px;">This is a custom tab widget, designed to follow the current theme.  You can put this inside a containing element anywhere inside your panel.<br><br>Continue with the other tabs for more information...</div>'));
        tabFrame.addTab('Custom Tab 2').addItem($('<div class="info" style="border:2px solid black;margin:20px;">Each tab has its own layout, and can be configured however you wish.</div>'));
        tabFrame.addTab('Custom Tab 3').addItem($('<div class="info" style="border:2px solid black;margin:20px;">These tabs can "optionally" be re-orderable by the user, try to change the tab ordering by dragging them.</div>'));
        tabFrame.addTab('Custom Tab 4').addItem($('<div class="info" style="border:2px solid black;margin:20px;">By default, tabs are not closeable, but we have enabled this one just for the sake of this demo.</div>'));
        tabFrame.addTab('Custom Tab 5').addItem($('<div class="info" style="border:2px solid black;margin:20px;">Besides a tab being closeable, other options exist for each tab, whether they have a scrollable contents, or if elements can be visible outside of its boundaries, and more.</div>'));
        tabFrame.closeable(3, true);
        tabFrame.faicon(0, 'gears')

        splitter.pane(1).addItem($('<div class="info" style="border:2px solid black;margin:20px;">The same splitter widget used to separate panels can also be used anywhere within a panel.  Each side of the splitter comes with its own layout.</div>'));

        // // Now create an IFrame widget and put it into the large split.
        // var $frameArea = $('<div style="width:100%;height:100%;position:relative;">');
        // splitter.pane(1).addItem($frameArea);
        // var iFrame = new wcIFrame($frameArea, myPanel);
        // iFrame.openURL('http://webcabin.org/');

        // Add a rotation panel button to change the orientation of the splitter.
        myPanel.addButton('View', 'fa fa-mail-reply', 'O', 'Switch between horizontal and vertical layout.', true, 'fa fa-mail-forward');

        // Create a panel button that shows information about this panel.
        myPanel.addButton('Info', 'fa fa-question', '?', 'Show information about this panel.');

        myPanel.on(wcDocker.EVENT_BUTTON, function(data) {
          if (data.name == 'View') {
            splitter.orientation(data.isToggled);
            subSplitter.orientation(!data.isToggled);
          } else if (data.name == 'Info') {
            // Use the preivously defined common function to popup the Info Panel.
            showInfo('The widget panel demonstrates some of the custom layout widgets provided for you by wcDocker.');
          }
        });
      }
    });

    // --------------------------------------------------------------------------------
    // Register the chat panel, a demonstration of the built in panel event/messaging
    // system to communicate between multiple chat panels.
    myDocker.registerPanelType('Chat Panel', {
      faicon: 'comment-o',
      onCreate: function(myPanel) {
        myPanel.layout().scene().css('padding', '10px');

        // Create our chat window.
        var $senderLabel    = $('<div style="white-space:nowrap;">Sender Name: </div>');
        var $senderName     = $('<input type="text" style="width:100%;padding:0px;" placeholder="Sender name here" value="Chatter' + _chatterIndex++ + '"/>');

        var $chatArea       = $('<textarea style="width:100%;height:100%;padding:0px;margin-top:10px;border:0px;" readonly></textarea>');
        var $chatEdit       = $('<input type="text" style="width:100%;padding:0px;" placeholder="Type a message here!"/>');
        var $chatSend       = $('<button>Send</button>');
        var $chatContainer  = $('<table style="width:100%;"><tr><td></td><td></td></tr></table>');
        $chatContainer.find('td').first().append($chatEdit).css('width', '100%');
        $chatContainer.find('td').last().append($chatSend).css('width', '1%');

        myPanel.layout().addItem($senderLabel, 0, 0).css('width', '1%');
        myPanel.layout().addItem($senderName, 1, 0).css('width', '100%');
        var chatCell = myPanel.layout().addItem($chatArea, 0, 1, 2, 1);
        myPanel.layout().addItem($chatContainer, 0, 2, 2, 1);

        chatCell.parent().css('height', '100%');

        // Send a chat message.
        function onChatSent() {
          var sender = $senderName.val();
          var message = $chatEdit.val();

          // Use our built in event/messaging system, this sends a message
          // of name "Message" to anyone who is listening to it, and sends
          // a data object that describes the message.
          myPanel.trigger('Message', {
            sender: sender,
            message: message,
          });

          $chatEdit.val('');
        };

        $chatEdit.keypress(function(event) {
          if (event.keyCode == 13) {
            onChatSent();
          }
        });
        $chatSend.click(onChatSent);

        // Register this panel to listen for any messages of type "Message".
        myPanel.on('Message', function(data) {
          // The data passed in is the data object sent by the sender.
          var text = data.sender + ': ' + data.message + '\n';
          $chatArea.html($chatArea.html() + text);
        });

        // Create a panel button that shows information about this panel.
        myPanel.addButton('Info', 'fa fa-question', '?', 'Show information about this panel.');
        myPanel.on(wcDocker.EVENT_BUTTON, function(data) {
          // Use the preivously defined common function to popup the Info Panel.
          showInfo('The chat panel demonstrates the use of the built-in event messaging system to broadcast information between panels.  Give yourself a name and then send a message, all chat panels will receive your message and display it.');
        });
      }
    });

    // --------------------------------------------------------------------------------
    // Register the batch panel, a demonstration of the layout batch system when
    // adding an overwhelming number of elements into the layout all at once.
    myDocker.registerPanelType('Batch Panel', {
      faicon: 'cubes',
      onCreate: function(myPanel) {
        myPanel.layout().scene().css('padding', '10px');

        var $clearItemsButton   = $('<button style="white-space:nowrap;">Clear Items</buttons>');
        var $normalAddButton    = $('<button style="white-space:nowrap;margin-left:10px;margin-right:10px;">Add Items Normally</button>');
        var $batchAddButton     = $('<button style="white-space:nowrap;">Add Items Batched</button>');

        myPanel.layout().addItem($clearItemsButton, 0, 0).css('text-align', 'right');
        myPanel.layout().addItem($normalAddButton, 1, 0).css('width', '1%');
        myPanel.layout().addItem($batchAddButton, 2, 0);

        // Here we do some css table magic to make all other cells align to the top of the window.
        // The returned element from addItem is always the <td> of the table, its' parent is the <tr>
        myPanel.layout().addItem('<div>', 0, 2).parent().css('height', '100%');

        var currentItemIndex = 0;
        function __addItems() {
          myPanel.layout().item(0, currentItemIndex+2).css('height', '');

          // Add a large number of items into the layout.
          var min = 0;
          var max = 2;
          for (var i = 0; i < 250; ++i) {
            currentItemIndex++;
            var randomInt = Math.floor(Math.random() * (max - min + 1)) + min;
            var $item = null;
            switch (randomInt) {
              case 0:
                $item = $('<div>Some Random Text Item</div>');
                break;
              case 1:
                $item = $('<input placeholder="Some Random Text Input"/>');
                break;
              case 2:
                $item = $('<button>Some Random Button</button>');
                break;
            }
            if ($item) {
              myPanel.layout().addItem($item, 0, currentItemIndex+2, 3, 1).css('border-bottom', '2px solid black').css('padding-bottom', '5px').css('text-align', 'center');
            }
          }
        };

        $clearItemsButton.click(function() {
          $('body').append($clearItemsButton).append($normalAddButton).append($batchAddButton);
          myPanel.layout().clear();
          myPanel.layout().scene().css('padding', '10px');
          myPanel.layout().addItem($clearItemsButton, 0, 0).css('text-align', 'right');
          myPanel.layout().addItem($normalAddButton, 1, 0).css('width', '1%');
          myPanel.layout().addItem($batchAddButton, 2, 0);

          // Here we do some css table magic to make all other cells align to the top of the window.
          // The returned element from addItem is always the <td> of the table, its' parent is the <tr>
          myPanel.layout().addItem('<div>', 0, 2).parent().css('height', '100%');
          currentItemIndex = 0;
        });

        $normalAddButton.click(function() {
          __addItems();
        });

        $batchAddButton.click(function() {
          myPanel.layout().startBatch();
          __addItems();
          myPanel.layout().finishBatch();
        });

        // Create a panel button that shows information about this panel.
        myPanel.addButton('Info', 'fa fa-question', '?', 'Show information about this panel.');
        myPanel.on(wcDocker.EVENT_BUTTON, function(data) {
          // Use the preivously defined common function to popup the Info Panel.
          showInfo("The batch panel demonstrates a speed comparison between adding layout items one at a time vs using the batching system. The batching system avoids re-calculating elements each time a new one is added until the batch has been finished. Use this if you are adding a large number of elements into the panel's layout.");
        });
      }
    });

    // ---------------------------------------------------------------------------
    // Register the instruction panel, explains the code used to initialize docker
    // as well as explains every panel type.
    myDocker.registerPanelType('How-To Panel', {
      faicon: 'graduation-cap',
      onCreate: HowToPanel,
    });

    // --------------------------------------------------------------------------------
    // Here we actually add all of our registered panels into our document.
    // The order that each panel is added makes a difference.  In general, start
    // by creating the center panel and work your way outwards in all directions.
    var howToPanel = myDocker.addPanel('How-To Panel', wcDocker.DOCK_BOTTOM);

    var topChatPanel = myDocker.addPanel('Chat Panel', wcDocker.DOCK_LEFT, null, {h: -1, w:400});
    var bottomChatPanel = myDocker.addPanel('Chat Panel', wcDocker.DOCK_BOTTOM, topChatPanel);

    var widgetPanel = myDocker.addPanel('Widget Panel', wcDocker.DOCK_RIGHT, false, {w:500,h:-1});
    var batchPanel = myDocker.addPanel('Batch Panel', wcDocker.DOCK_STACKED, widgetPanel);
    var controlPanel = myDocker.addPanel('Control Panel', wcDocker.DOCK_TOP, widgetPanel);

    myDocker.addPanel('Top Panel', wcDocker.DOCK_TOP);
  }
});