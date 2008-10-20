<?php
//TODO finish refactoring regexs
//finish writing tests
class SimpleProxy{
  
  protected $Doc;
  protected $OrigUrl;
  protected $BaseUrl;
  protected $RelativeBaseUrl;
  protected $CurrentDirUrl;
  
  public function __construct($Url,$Doc){
    $this->OrigUrl = $Url;
    $this->Doc = $Doc;
    $this->processUrl();
    $this->processDoc();
  }
  
  public function getBaseUrl(){
    return $this->BaseUrl;
  }
  
  public function getOrigUrl(){
    return $this->OrigUrl;
  }
  
  public function getRelativeBaseUrl(){
    return $this->RelativeBaseUrl;
  }
  
  public function getCurrentDirUrl(){
    return $this->CurrentDirUrl;
  }
  
  public function setDoc($doc){
    $this->doc = $Doc;
  }
  
  public function setUrl($OrigUrl){
    $this->OrigUrl = $OrigUrl;
  }
  
  public function getProcessedDoc(){
    $this->processDoc();
    return $this->Doc;
  }
  
  private function processUrl(){
    $this->setBaseUrl();
    $this->setRelativeBaseUrl();
    $this->setCurrentDirUrl();
  }
  
  private function processDoc(){
    $this->processSrcLinks();
    $this->processHrefLinks();
    $this->processJavasScript();
    $this->processCssImports();
  }
  
  private function setBaseUrl(){
    /*
    http://nytimes.com/dir/file.html to nytimes.com/
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
    // if beings with src="/
    $this->Doc = preg_replace("/src=\"\//i","src=\"$this->BaseUrl" ,$this->Doc);
    // if begins with src="../
    $this->Doc = preg_replace("/src=\"\.\./i","src=\"$this->RelativeBaseUrl" ,$this->Doc);
    // if begins with src="word/ && word != http or www
    $this->Doc = preg_replace("/src=\"(?!http|www)\//i","src=\"$this->OrigUrl",$this->Doc);  
    
  }
  
  private function processHrefLinks(){
    // href=/
    $this->Doc = preg_replace("/href=\"\//i","href=\"$this->BaseUrl/" ,$this->Doc);
    // href="folder/file
    $this->Doc = preg_replace("/href=\"(?=[^http|\/|www|\.\.])/i","href=\"$this->OrigUrl" ,$this->Doc);
    // href ="./
    $this->Doc = preg_replace("/href=\"\.\//","href=\"$this->CurrentDirUrl",$this->Doc);
    // href="../
    $this->Doc = preg_replace("/href=\"\.\./i","href=\"$this->RelativeBaseUrl" ,$this->Doc);
  }
  
  private function processJavasScript(){
    $this->Doc = preg_replace("/<script.*?<\/script>/ims","<!--removedjavascript-->",$this->Doc);
    $this->Doc = preg_replace("/onresize=\".*?\"/i","",$this->Doc);
    $this->Doc = preg_replace("/onload=\".*?\"/i","",$this->Doc);
    $this->Doc = preg_replace("/onresize=\'.*?\'/i","",$this->Doc);
    $this->Doc = preg_replace("/onload=\'.*?\'/i","",$this->Doc);    
  }
  
  private function processCssImports(){
    // css imports
    $this->Doc = preg_replace("/@import\s+url\(\//i","@import url($this->BaseUrl", $this->Doc);
  }    
}
?>
