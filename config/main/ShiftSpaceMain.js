if(self == top)
{
  try
  {
    GM_log('We are top level, starting up');
    ShiftSpace.initialize();
  }
  catch(exc)
  {
    if(console)
    {
      if (console.error) console.error("Unable to install ShiftSpace :(, " + exc);
      if (console.log) console.log("Unable to install ShiftSpace :(, " + exc);
    } 
  }
}