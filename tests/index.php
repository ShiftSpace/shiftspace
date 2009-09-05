<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Test Runner</title>
    <script>
      var ShiftSpace = {};
    </script>
    <script src="../externals/mootools-1.2.3-core.js" type="text/javascript" charset="utf-8"></script>
    <script src="../externals/mootools-1.2.3.1-more.js" type="text/javascript" charset="utf-8"></script>
    <script src="SSTestRunner.js" type="text/javascript" charset="utf-8"></script>
    <script src="init.js" type="text/javascript" charset="utf-8"></script>
    <script src="../builds/shiftspace.sandalphon.js" type="text/javascript" charset="utf-8"></script>
    <script src="../externals/ssunit/SSException.js" type="text/javascript" charset="utf-8"></script>
    <script src="../externals/ssunit/SSUnitTest.js" type="text/javascript" charset="utf-8"></script>
    <link rel="stylesheet" href="../styles/ShiftSpace.css" type="text/css" media="screen" title="no title" charset="utf-8" />
    <link rel="stylesheet" href="sandalphon.css" type="text/css" media="screen" title="no title" charset="utf-8" />
    
  <body>
    
    <div id="SSSandalphonControls">
      <div style="float: left;">
        <form action="">
          <table>
            <tr>
              <th>Load Test:</th>
              <td>
                <input id="loadTestInput" type="text" value="SSDefaultTest">
                </input>
                <input id="loadTest" type="button" name="Load & Run" value="Load & Run">
                </input>
              </td>
            </tr>
          </table>
        </form>
      </div>
      <span id='title'>ShiftSpace TestRunner v0.1</span>
    </div>
    
    <div id="SSSandalphonDisplay">
      <div id="SSTestRunnerStage"></div>
      <div id="SSTestRunnerOutput"></div>
    </div>
    
  </body>  
  
</html>
