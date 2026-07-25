{
  description = "ft_transcendence";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    let
      utils = flake-utils;
    in
    utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = [
                      pkgs.bun
                      pkgs.git
                      pkgs.cacert
                      pkgs.curl
                      pkgs.gnupg
                      pkgs.openssh
                      pkgs.mkcert
                      pkgs.nodejs
                      pkgs.patchelf
                    ];
        shellHook = ''
          echo "🚀 ft_transcendence dev environment"
          echo ""
          echo "Bun: $(bun --version)"
          echo "Node: $(node --version)"
          echo ""
          echo "Some useful commands:"
          echo "  bun dev          - Start full dev server"
          echo "  bun dev:frontend - Start frontend only"
          echo "  bun dev:backend  - Start backend only"
          echo "  bun check        - Run type checks and linting"
          echo "  bun fmt:fix      - Format all code"
          echo "  bun db:migrate   - Run database migrations"
          echo "  bun test         - Run all tests"
          echo ""
          if [ -d node_modules ]; then
            bash scripts/fix-native-binaries.sh
          fi
        '';
        };
      }
    );
}
