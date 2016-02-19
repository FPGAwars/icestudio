module counter (input clk, output c0, c1, c2, c3);
 reg [3:0] c = 0;
 always @(posedge clk)
  c <= c + 1;
 assign c0 = c[0];
 assign c1 = c[1];
 assign c2 = c[2];
 assign c3 = c[3];
endmodule
