<?php
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
    /*BLAR ?*/
            /*BLAR ?*/
  }

 public function setUrl($OrigUrl){
    $this->OrigUrl = $OrigUrl;
    /*rewrite necessary url types (relative,root,etc)*/
    $this->processURL();
  }
  
  public function setDoc($Doc){
    $this->Doc = $Doc;
    $this->processDoc();
  }
  
  public function getUrl(){
    return $this->OrigUrl;
  }
  
  public function getBaseUrl(){
    return $this->BaseUrl;
  }
  
  public function getRelativeBaseUrl(){
    return $this->RelativeBaseUrl;
  }
  
  public function getCurrentDirUrl(){
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
    
    i.e. baseUrl = nytimes.com/weather/ and there exists on
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
    i.e. ./styles/style.css
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
    $this->ProcessedDoc = preg_replace("/src=\"\//i","src=\"$this->BaseUrl" ,$this->Doc);
    // src="./
    $this->ProcessedDoc = preg_replace("/src=\"\.\//","src=\"$this->CurrentDirUrl",$this->Doc);
    // src="../
    $this->ProcessedDoc = preg_replace("/src=\"\.\./i","src=\"$this->RelativeBaseUrl" ,$this->Doc);
    // src="word/ && word != http or www
    $this->ProcessedDoc = preg_replace("/src=\"(?!http|www)\//i","src=\"$this->OrigUrl",$this->Doc);  
    
  }
  
  private function processHrefLinks(){
    // href=/
    $this->ProcessedDoc = preg_replace("/href=\"\//i","href=\"$this->BaseUrl/" ,$this->Doc);
    // href="folder/file
    $this->ProcessedDoc = preg_replace("/href=\"(?=[^http|\/|www|\.\.])/i","href=\"$this->OrigUrl" ,$this->Doc);
    // href ="./
    $this->ProcessedDoc = preg_replace("/href=\"\.\//","href=\"$this->CurrentDirUrl",$this->Doc);
    // href="../
    $this->ProcessedDoc = preg_replace("/href=\"\.\./i","href=\"$this->RelativeBaseUrl" ,$this->Doc);
  }
  
  private function processJavaScript(){
    $this->ProcessedDoc = preg_replace("/<script.*?<\/script>/ims","<!--removedjavascript-->",$this->Doc);
    $this->ProcessedDoc = preg_replace("/onresize=\".*?\"/i","",$this->Doc);
    $this->ProcessedDoc = preg_replace("/onload=\".*?\"/i","",$this->Doc);
    $this->ProcessedDoc = preg_replace("/onresize=\'.*?\'/i","",$this->Doc);
    $this->ProcessedDoc = preg_replace("/onload=\'.*?\'/i","",$this->Doc);    
  }
  
  private function processCssImports(){
    // css imports
    $this->ProcessedDoc = preg_replace("/@import\s+url\(\//i","@import url($this->BaseUrl", $this->Doc);
  }    
}
?>
