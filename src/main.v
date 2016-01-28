// Generated verilog

module andc(input a, b, output c);
assign c = a & b;
endmodule

module notc(input a, output b);
assign b = ! a;
endmodule

module main(input A, B, output C);
wire aux;
andc andc0 (
    .a(A),
    .b(B),
    .c(aux)
);
notc notc1 (
    .a(aux),
    .b(C)
);
endmodule
