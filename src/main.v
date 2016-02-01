// Generated verilog

module notx(input i0, output o0);
assign o0 = ! i0;
endmodule

module andx(input i0, i1, output o0);
assign o0 = i0 & i1;
endmodule

module main(input i0, i1, output o0);
wire w0;
wire w1;
wire w2;
wire w3;
assign w0 = i0;
assign w1 = i1;
assign w3 = o0;
andx and0(
    .i0(w0),
    .i1(w1),
    .o0(w2)
);
notx not0(
    .i0(w2),
    .o0(w3)
);
endmodule
