window.addEvent('domready', InitMoMASocialBar);

var Console;
function InitMoMASocialBar()
{
  if(Browser.Engine.trident && (Browser.Engine.version < 7)) return;
  Console = new MoMAConsole();
}