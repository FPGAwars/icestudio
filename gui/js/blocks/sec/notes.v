//-- Author: obijuan


module genrom #(             //-- Parametros
         parameter AW = 5,   //-- Bits de las direcciones (Adress width)
         parameter DW = 4)   //-- Bits de los datos (Data witdh)

       (                              //-- Puertos
         input clk,                   //-- Señal de reloj global
         input wire [AW-1: 0] addr,   //-- Direcciones
         output reg [DW-1: 0] data);  //-- Dato de salida

//-- Parametro: Nombre del fichero con el contenido de la ROM
parameter ROMFILE = "gui/js/blocks/sec/imperial.list";

//-- Calcular el numero de posiciones totales de memoria
localparam NPOS = 2 ** AW;

  //-- Memoria
  reg [DW-1: 0] rom [0: NPOS-1];

  //-- Lectura de la memoria
  always @(posedge clk) begin
    data <= rom[addr];
  end

//-- Cargar en la memoria el fichero ROMFILE
//-- Los valores deben estan dados en hexadecimal
initial begin
  $readmemh(ROMFILE, rom);
end

endmodule


module notegen(input wire clk,          //-- Senal de reloj global
               input wire rstn,         //-- Reset
               input wire [15:0] note,  //-- Divisor
               output reg clk_out);     //-- Señal de salida

wire clk_tmp;

//-- Registro para implementar el contador modulo note
reg [15:0] divcounter = 0;

//-- Contador módulo note
always @(posedge clk)

  //-- Reset
  if (rstn == 0)
    divcounter <= 0;

  //-- Si la nota es 0 no se incrementa contador
  else if (note == 0)
    divcounter <= 0;

  //-- Si se alcanza el tope, poner a 0
  else if (divcounter == note - 1)
    divcounter <= 0;

  //-- Incrementar contador
  else
    divcounter <= divcounter + 1;

//-- Sacar un pulso de anchura 1 ciclo de reloj si el generador
assign clk_tmp = (divcounter == 0) ? 1 : 0;

//-- Divisor de frecuencia entre 2, para obtener como salida una señal
//-- con un ciclo de trabajo del 50%
always @(posedge clk)
  if (rstn == 0)
    clk_out <= 0;

  else if (note == 0)
    clk_out <= 0;

  else if (clk_tmp == 1)
    clk_out <= ~clk_out;

endmodule


`define T_100ms  1200000
`define T_200ms  2400000

//-- ENTRADAS:
//--     -clk: Senal de reloj del sistema (12 MHZ en la iceStick)
//
//-- SALIDAS:
//--     - clk_out. Señal de salida para lograr la velocidad en baudios indicada
//--                Anchura de 1 periodo de clk. SALIDA NO REGISTRADA
module dividerp1(input wire clk,
                 output wire clk_out);

//-- Valor por defecto de la velocidad en baudios
parameter M = `T_100ms;

//-- Numero de bits para almacenar el divisor de baudios
localparam N = $clog2(M);

//-- Registro para implementar el contador modulo M
reg [N-1:0] divcounter = 0;

//-- Contador módulo M
always @(posedge clk)
    divcounter <= (divcounter == M - 1) ? 0 : divcounter + 1;

//-- Sacar un pulso de anchura 1 ciclo de reloj si el generador
assign clk_out = (divcounter == 0) ? 1 : 0;

endmodule


module romnotes(input wire clk,
                output wire ch_out);

//-- Parametros
//-- Duracion de las notas
parameter DUR = `T_200ms;

//-- Fichero con las notas para cargar en la rom
parameter ROMFILE = "gui/js/blocks/sec/imperial.list";

//-- Tamaño del bus de direcciones de la rom
parameter AW = 6;

//-- Tamaño de las notas
parameter DW = 16;

//-- Cables de salida de los canales
wire ch0, ch1, ch2;

//-- Selección del canal del multiplexor
reg [AW-1: 0] addr = 0;

//-- Reloj con la duracion de la nota
wire clk_dur;
reg rstn = 0;

wire [DW-1: 0] note;

//-- Instanciar la memoria rom
genrom
  #( .ROMFILE(ROMFILE),
     .AW(AW),
     .DW(DW))
  ROM (
        .clk(clk),
        .addr(addr),
        .data(note)
      );

//-- Generador de notas
notegen
  CH0 (
    .clk(clk),
    .rstn(rstn),
    .note(note),
    .clk_out(ch_out)
  );

//-- Inicializador
always @(posedge clk)
  rstn <= 1;


//-- Contador para seleccion de nota
always @(posedge clk)
  if (clk_dur)
    addr <= addr + 1;

//-- Divisor para marcar la duración de cada nota
dividerp1 #(DUR)
  TIMER0 (
    .clk(clk),
    .clk_out(clk_dur)
  );

endmodule
