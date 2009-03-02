<?php


define('SESSION_DB_HOST', 'momaorgdbp1.museum.moma.org');
define('SESSION_DB_USER', 'shiftspace');
define('SESSION_DB_PASS', '3ma1lbr0k3n');
define('SESSION_DB_NAME', 'shiftspace');

class PhpDbSession
{
    var $dbhSession;
    var $uxtLifetime;

    function connect()
    {
        if(!$this->dbhSession)
        {
            $this->dbhSession = mysql_connect(SESSION_DB_HOST, SESSION_DB_USER, SESSION_DB_PASS) or die('Session connect error!');

            mysql_select_db(SESSION_DB_NAME, $this->dbhSession) or die('Session database error!');
        }
    }

    function open($strSavePath, $strName)
    {
        // session.gc_maxlifetime is in minutes

        $this->uxtLifetime = ini_get("session.gc_maxlifetime") * 60;

        $this->connect();

        return true;
    }

    function close()
    {
        $this->connect();

        $this->garbageCollect(ini_get('session.gc_maxlifetime'));

        return @mysql_close($this->dbhSession);
    }
    
    function read($strName)
    {
        $this->connect();

        $strSql = "SELECT txtData FROM tblSession WHERE vchName = '$strName' AND uxtExpires > " . time();

        $refResult = mysql_query($strSql, $this->dbhSession);

        if($arrData = mysql_fetch_assoc($refResult))
        {
            return $arrData['txtData'];
        }
        else
        {
            return '';
        }
    }

    function write($strName, $unkData)
    {
        $this->connect();

        $unkData = addslashes($unkData); // Do we need this?

        $uxtExpire = time() + $this->uxtLifetime;

        $strSql = "SELECT * FROM tblSession WHERE vchName = '$strName'";

        $refResult = mysql_query($strSql, $this->dbhSession) or die('Session write error!' . mysql_error($this->dbhSession));

        if(mysql_num_rows($refResult))
        {
            $strSql = "UPDATE tblSession SET uxtExpires = '$uxtExpire', txtData = '$unkData' WHERE vchName = '$strName'";

            $refResult = mysql_query($strSql, $this->dbhSession) or die('Session update error!');
        }
        else
        {
            $strSql = "INSERT INTO tblSession (vchName, uxtExpires, txtData) VALUES ('$strName', '$uxtExpire', '$unkData')";

            $refResult = mysql_query($strSql, $this->dbhSession) or die('Session append error!');
        }

        return true;
    }

    function destroy($strName)
    {
        $this->connect();

        $strSql = "DELETE FROM tblSession WHERE vchName = '$strName'";

        $refResult = mysql_query($strSql, $this->dbhSession) or die('Session destroy error!');
    }

    function garbageCollect($uxtSessionMaxLifetime)
    {
        $this->connect();

        $strSql = "DELETE FROM tblSession WHERE uxtExpires < '" . time() . "'";

        $refResult = mysql_query($strSql, $this->dbhSession) or die('Session maintenance error!');
    }

    function setLifetime($intSeconds)
    {
        $this->uxtLifetime = $intSeconds;
    }
}

// We only want sessions for web things
if(isset($_SERVER['DOCUMENT_ROOT']))
{
    $objPhpSession = new PhpDbSession();
    
    session_set_save_handler(array(&$objPhpSession,"open"),
                             array(&$objPhpSession,"close"),
                             array(&$objPhpSession,"read"),
                             array(&$objPhpSession,"write"),
                             array(&$objPhpSession,"destroy"),
                             array(&$objPhpSession,"garbageCollect"));
}
























$dir = dirname(__FILE__);

require_once "$dir/library/base.php";
try {
  $server = Base_Server::singleton('server.ini', 'working/server.ini');
  $server->main();
} catch (Exception $e) {
  echo 'Error: ' . $e->getMessage();
}

// testing

?>
