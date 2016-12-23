module DIV (input clk, output out);

 parameter N = 22;
 localparam M = $pow(2, N); // 2**N

 wire clk_temp;
 reg [N - 1:0] c = 0;
 reg dout;

 assign out = dout;

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
   out <= 0;
  else if (clk_temp == 1)

 dout <= ~dout;
 
endmodule
