module dec (input c, output reg o0, o1);
 always @(*)
  begin
   o0 = (c == 0) ? 1 : 0;
   o1 = (c == 1) ? 1 : 0;
  end
endmodule
