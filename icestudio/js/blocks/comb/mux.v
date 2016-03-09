module mux (input c0, c1, sel, output reg o);
 always @(*)
  o = (sel == 0) ? c0 : c1;
endmodule
