
#-- Arty S7-25 (Digilent)
#-- Derived from Digilent's Arty-S7-25-Master.xdc:
#-- https://github.com/Digilent/digilent-xdc/blob/master/Arty-S7-25-Master.xdc

#-- System clock (12 MHz)
set_property -dict { PACKAGE_PIN F14  IOSTANDARD LVCMOS33 } [get_ports {clk}]

#-- LEDs (LD2-LD5)
set_property -dict { PACKAGE_PIN E18  IOSTANDARD LVCMOS33 } [get_ports {leds[0]}]
set_property -dict { PACKAGE_PIN F13  IOSTANDARD LVCMOS33 } [get_ports {leds[1]}]
set_property -dict { PACKAGE_PIN E13  IOSTANDARD LVCMOS33 } [get_ports {leds[2]}]
set_property -dict { PACKAGE_PIN H15  IOSTANDARD LVCMOS33 } [get_ports {leds[3]}]

#-- Push buttons (BTN0-BTN3)
set_property -dict { PACKAGE_PIN G15  IOSTANDARD LVCMOS33 } [get_ports {buttons[0]}]
set_property -dict { PACKAGE_PIN K16  IOSTANDARD LVCMOS33 } [get_ports {buttons[1]}]
set_property -dict { PACKAGE_PIN J16  IOSTANDARD LVCMOS33 } [get_ports {buttons[2]}]
set_property -dict { PACKAGE_PIN H13  IOSTANDARD LVCMOS33 } [get_ports {buttons[3]}]

#-- Slide switches (SW0-SW3)
#-- SW3 sits in the DDR-adjacent bank and needs SSTL135, not LVCMOS33.
set_property -dict { PACKAGE_PIN H14  IOSTANDARD LVCMOS33 } [get_ports {switches[0]}]
set_property -dict { PACKAGE_PIN H18  IOSTANDARD LVCMOS33 } [get_ports {switches[1]}]
set_property -dict { PACKAGE_PIN G18  IOSTANDARD LVCMOS33 } [get_ports {switches[2]}]
set_property -dict { PACKAGE_PIN M5   IOSTANDARD SSTL135  } [get_ports {switches[3]}]

#-- USB-UART bridge
set_property -dict { PACKAGE_PIN R12  IOSTANDARD LVCMOS33 } [get_ports {uart_rx_async}]
set_property -dict { PACKAGE_PIN V12  IOSTANDARD LVCMOS33 } [get_ports {uart_tx}]

set_property CFGBVS VCCO [current_design]
set_property CONFIG_VOLTAGE 3.3 [current_design]
