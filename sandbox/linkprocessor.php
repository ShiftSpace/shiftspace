<?php
/*
//for debugging with firePHP
require_once('FirePHPCore/FirePHP.class.php');
ob_start();
*/

//TODO finish refactoring regexs
//finish writing tests
class LinkProcessor{
  /*
  $lp = new LinkProcessor();
  $lp->setUrl('www.example.com');
  $lp->setDoc(docString);
  $processed_doc = $lp->getProcessedDoc();
  */
  protected $Doc;               //the original document
  protected $ProcessedDoc;      //the document with rewritten links
  protected $OrigUrl;           //original url
  protected $BaseUrl;           //the base url
  protected $RelativeBaseUrl;   //the original url up one in directory tree
  protected $CurrentDirUrl;     //the current directory
  
  public function __construct(){
    /*$this->firephp = FirePHP::getInstance(true);*/
  }

 public function setUrl($OrigUrl){
    $this->OrigUrl = $OrigUrl;
    /*rewrite necessary url types (relative,root,etc)*/
    $this->processURL();
  }
  
  public function setDoc($Doc){
    $this->Doc = $Doc;
    $this->ProcessedDoc = $Doc;
    $this->processDoc();
  }
  
  public function getUrl(){
    /*$this->firephp->log($this->OrigUrl,"getUrl");*/
    return $this->OrigUrl;
  }
  
  public function getBaseUrl(){
    /*$this->firephp->log($this->BaseUrl,"getBaseUrl");*/
    return $this->BaseUrl;
  }
  
  public function getRelativeBaseUrl(){
    /*$this->firephp->log($this->RelativeBaseUrl,"getRelativeBaseUrl");*/
    return $this->RelativeBaseUrl;
  }
  
  public function getCurrentDirUrl(){
    /*$this->firephp->log($this->CurrentDirUrl,"getCurrentDirUrl");*/
    return $this->CurrentDirUrl;
  }
  
  public function getDoc(){
    return $this->Doc;
  }
  
  public function getProcessedDoc(){
    return $this->ProcessedDoc;
  }
  
  private function processUrl(){
    $this->setBaseUrl();
    $this->setRelativeBaseUrl();
    $this->setCurrentDirUrl();
  }
    
  private function processDoc(){
    $this->processSrcLinks();
    $this->processHrefLinks();
    $this->processJavaScript();
    $this->processCssImports();
  }
  
  private function setBaseUrl(){
    /*
    http://nytimes.com/dir/file.html to http://nytimes.com/
    */
    $regex = "/
              ^(http:\/\/)?   #optional 
              ([^\/]+)        #match not fslash followed by fslash
              /ix";
    preg_match($regex,$this->OrigUrl, $matches);
    $this->BaseUrl = 'http://' .$matches[2] . "/";
  }
  
  private function setRelativeBaseUrl(){
    /*
    http://nytimes.com/dir1/dir2 to http://nytimes.com/dir1/
    
    e.g. baseUrl = nytimes.com/weather/ and there exists on
    the page ../images/myImage.jpg we want to: 
    src="nytimes.com/images/myImage.jpg"
    */
    $regex = "/
              .+\/            #match up to + including fslash
              (?=.+\/.+$)     #if followed by string + fslash + string
              /x";
    preg_match($regex,$this->OrigUrl,$matches);
    $this->RelativeBaseUrl = $matches[0];
  }
  
  private function setCurrentDirUrl(){
    /*
    http://nytimes.com/dir1/index.html to http://nytimes/dir1/
    
    for paths that start with ./
    e.g. ./styles/style.css
    */
    $regex = "/
              (.+\/)          #match up to + including last fslash
              (.+$)?          #after fslash if exists
              /x";
    preg_match($regex,$this->OrigUrl,$matches);
    $this->CurrentDirUrl = $matches[1];
  }
  
  private function processSrcLinks(){
    // replace relative links with absolute links
    // src="/
    $this->ProcessedDoc = preg_replace("/src=\"\//i","src=\"$this->BaseUrl" ,$this->ProcessedDoc);
    // src="./
    $this->ProcessedDoc = preg_replace("/src=\"\.\//i","src=\"$this->CurrentDirUrl",$this->ProcessedDoc);
    // src="../
    $this->ProcessedDoc = preg_replace("/src=\"\.\.\//i","src=\"$this->RelativeBaseUrl" ,$this->ProcessedDoc);
    // src="word/ && word != http or www
    $this->ProcessedDoc = preg_replace("/src=\"(?=[^http|\/|www|\.\.])/i","src=\"$this->CurrentDirUrl" ,$this->ProcessedDoc);
  }
  
  private function processHrefLinks(){
    // href=/
    $this->ProcessedDoc = preg_replace("/href=\"\//i","href=\"$this->BaseUrl" ,$this->ProcessedDoc);
    // href="folder/file
    $this->ProcessedDoc = preg_replace("/href=\"(?=[^http|\/|www|\.\.])/i","href=\"$this->CurrentDirUrl" ,$this->ProcessedDoc);
    // href ="./
    $this->ProcessedDoc = preg_replace("/href=\"\.\//","href=\"$this->CurrentDirUrl",$this->ProcessedDoc);
    // href="../
    $this->ProcessedDoc = preg_replace("/href=\"\.\.\//i","href=\"$this->RelativeBaseUrl" ,$this->ProcessedDoc);
  }
  
  private function processJavaScript(){
    $this->ProcessedDoc = preg_replace("/<script.*?<\/script>/ims","<!--removedjavascript-->",$this->ProcessedDoc);
    $this->ProcessedDoc = preg_replace("/onresize=\".*?\"/i","",$this->ProcessedDoc);
    $this->ProcessedDoc = preg_replace("/onload=\".*?\"/i","",$this->ProcessedDoc);
    $this->ProcessedDoc = preg_replace("/onresize=\'.*?\'/i","",$this->ProcessedDoc);
    $this->ProcessedDoc = preg_replace("/onload=\'.*?\'/i","",$this->ProcessedDoc);
  }
  
  private function processCssImports(){
    // css imports
    $this->ProcessedDoc = preg_replace("/@import\s+url\(\//i","@import url($this->BaseUrl", $this->ProcessedDoc);
  }    
}
?>
