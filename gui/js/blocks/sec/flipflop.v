module flipflop (input clk, rst, d, ena, output reg q);
 always @(posedge clk)
  begin
   if (rst)
    q <= 0;
   else
    if (ena)
     q <= d;
  end
endmodule
