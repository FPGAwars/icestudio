import os
from SCons.Script import (Builder, Environment, Default)

TARGET = "src/main"
VER = "src/main.v"
PCF = "src/main.pcf"

# -- Builder 1 (.v --> .blif)
synth = Builder(action='yosys -p \"synth_ice40 -blif {}.blif\" \
                        $SOURCES'.format(TARGET),
                suffix='.blif',
                src_suffix='.v')

# -- Builder 2 (.blif --> .asc)
pnr = Builder(action='arachne-pnr -d 1k -o $TARGET -p {} \
                      $SOURCE'.format(PCF),
              suffix='.asc',
              src_suffix='.blif')

# -- Builder 3 (.asc --> .bin)
bitstream = Builder(action='icepack $SOURCE $TARGET',
                    suffix='.bin',
                    src_suffix='.asc')

env = Environment(BUILDERS={'Synth': synth, 'PnR': pnr, 'Bin': bitstream},
                  ENV=os.environ)

blif = env.Synth(TARGET, [VER])
asc = env.PnR(TARGET, [blif, PCF])
binf = env.Bin(TARGET, asc)

upload = env.Alias('upload', binf, 'iceprog ' + ' $SOURCE')
AlwaysBuild(upload)

Default([binf])
