if(self == top)
{
  try
  {
    GM_log('We are top level, starting up');
    ShiftSpace.initialize();
  }
  catch(exc)
  {
    console.error("Unable to install ShiftSpace :(, " + SSDescribeException(exc));
  }
}