if(self == top)
{
  try
  {
    console.log('starting up');
    ShiftSpace.initialize();
  }
  catch(exc)
  {
    console.error("Unable to install ShiftSpace :(, " + SSDescribeException(exc));
  }
}