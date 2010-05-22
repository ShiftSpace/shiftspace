if(self == top)
{
  try
  {
    GM_log('We are top level, starting up');
    ShiftSpace.initialize();
  }
  catch(exc)
  {
    GM_log("Unable to install ShiftSpace :(, " + exc);
  }
}