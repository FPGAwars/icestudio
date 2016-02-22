module timer #(parameter N=22, M=4194304)(input clk, output wire out);
 reg [N-1:0] c = 0;
 always @(posedge clk)
  c <= (c == M - 1) ? 0 : c + 1;
 assign out = (c == M - 1) ? 1 : 0;
endmodule
