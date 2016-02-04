module div #(parameter N=22, M=4194304)(input clk, output reg o);
 wire clk_temp;
 reg [N - 1:0] c = 0;
 always @(posedge clk)
  if (M == 0)
   c <= 0;
  else if (c == M - 1)
   c <= 0;
  else
   c <= c + 1;
 assign clk_temp = (c == 0) ? 1 : 0;
 always @(posedge clk)
  if (N == 0)
   o <= 0;
  else if (clk_temp == 1)
   o <= ~o;
endmodule
