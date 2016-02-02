// Generated verilog

module driver1x(output o0);
assign o0 = 1'b1;
endmodule

module andx(input i0, i1, output o0);
assign o0 = i0 & i1;
endmodule

module main(output output23);
wire w0;
wire w1;
wire w2;
assign output23 = w2;
driver1x driver119 (
    .o0(w0)
);
driver1x driver120 (
    .o0(w1)
);
andx and24 (
    .i0(w0),
    .i1(w1),
    .o0(w2)
);
endmodule
