// Generated verilog

module driver1x(output o0);
assign o0 = 1'b1;
endmodule

module andx(input i0, i1, output o0);
assign o0 = i0 & i1;
endmodule

module main(output output14);
wire w0;
wire w1;
wire w2;
assign output14 = w1;
driver1x driver112 (
    .o0(w0)
);
andx and13 (
    .i1(w0),
    .o0(w1),
    .i0(w2)
);
driver1x driver115 (
    .o0(w2)
);
endmodule
