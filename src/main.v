// Generated verilog

module andx(input i0, i1, output o0);
assign o = i0 & i1;
endmodule

module notx(input i0, output o0);
assign o0 = ! i0;
endmodule

module main(input i0, i1, output o0);
wire w0;
andx and0 (
    .i0(i0),
    .i1(i1),
    .o0(w0)
);
notx not0 (
    .i0(w0),
    .o0(o0)
);
endmodule
