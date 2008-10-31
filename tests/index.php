<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Test Runner</title>
    
    <!-- Load mootools script files -->
    <script src="../mootools/mootools-1.2-core.js" type="text/javascript" charset="utf-8"></script>
    <script src="../mootools/mootools-1.2-more.js" type="text/javascript" charset="utf-8"></script>
    <script src="../client/Exception.js" type="text/javascript" charset="utf-8"></script>
    <script src="../client/SSUnitTest.js" type="text/javascript" charset="utf-8"></script>
    <!-- 
    <script src="../packages&load=SSUnitTest" type="text/javascript" charset="utf-8"></script>
      -->
      
    <!-- Load the relevant style files -->
    <link rel="stylesheet" href="../styles/ShiftSpace.css" type="text/css" media="screen" title="no title" charset="utf-8" />
    <link rel="stylesheet" href="sandalphon.css" type="text/css" media="screen" title="no title" charset="utf-8" />
  <body>
    
    <div id="SSSandalphonControls">
      <div style="float: left;">
        <form action="">
          <table>
            <tr>
              <th>Load Interface File:</th>
              <td>
                <input id="loadFileInput" type="text" value="/client/views/SSConsole/SSConsole"></input>
                <!--<input id="loadFile" type="button" name="LoadInterface" value="Load"></input>-->
                <input id="compileFile" type="button" name="Compile" value="Compile"></input>
              </td>
            </tr>
            <tr>
              <th>Load Test File:</th>
              <td>
                <input id="loadTestInput" type="text" value="/client/views/SSConsole/test.js"></input>
                <input id="loadTestFile" type="button" name="LoadTest" value="Load"></input>
              </td>
            </tr>
          </table>
        </form>
      </div>
      <span id='title'>Sandalphon v0.1</span>
    </div>
    
    <div id="SSSandalphonDisplay">
      <div id="SSSandalphonContainer">
      </div>
    </div>
    
  </body>  
  
</html>