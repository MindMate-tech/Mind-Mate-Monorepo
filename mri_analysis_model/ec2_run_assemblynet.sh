#!/bin/bash
# MindMate.tech - MRI Analysis Script for EC2
# Built at Hack Princeton by Students
# Usage: ./ec2_run_assemblynet.sh <input_file.nii.gz> [age] [sex] [output_dir]

set -e

# Configuration
INPUT_FILE="${1:-}"
AGE="${2:-}"
SEX="${3:-}"
OUTPUT_DIR="${4:-~/mri_data/output}"
INPUT_DIR="~/mri_data/input"
DOCKER_IMAGE="volbrain/assemblynet:1.0.0"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if input file is provided
if [ -z "$INPUT_FILE" ]; then
    echo -e "${RED}Error: Input file required${NC}"
    echo "Usage: $0 <input_file.nii.gz> [age] [sex] [output_dir]"
    echo "Example: $0 brain_scan.nii.gz 50 Male"
    exit 1
fi

# Check if file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo -e "${RED}Error: Input file not found: $INPUT_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}Starting MindMate.tech MRI Analysis...${NC}"
echo "Input file: $INPUT_FILE"
echo "Output directory: $OUTPUT_DIR"

# Build Docker command
DOCKER_CMD="sudo docker run --rm"

# Check if GPU is available
if command -v nvidia-smi &> /dev/null; then
    if nvidia-smi &> /dev/null; then
        echo -e "${GREEN}GPU detected, using GPU acceleration${NC}"
        DOCKER_CMD="$DOCKER_CMD --gpus '\"device=0\"'"
    fi
else
    echo -e "${YELLOW}No GPU detected, using CPU${NC}"
fi

# Add volume mounts
DOCKER_CMD="$DOCKER_CMD -v $(dirname $INPUT_FILE):/data"
DOCKER_CMD="$DOCKER_CMD -v $OUTPUT_DIR:/data_out"

# Add image
DOCKER_CMD="$DOCKER_CMD $DOCKER_IMAGE"

# Add age and sex if provided
if [ ! -z "$AGE" ]; then
    DOCKER_CMD="$DOCKER_CMD -age $AGE"
fi

if [ ! -z "$SEX" ]; then
    DOCKER_CMD="$DOCKER_CMD -sex $SEX"
fi

# Add input file (relative to mounted volume)
INPUT_BASENAME=$(basename "$INPUT_FILE")
DOCKER_CMD="$DOCKER_CMD /data/$INPUT_BASENAME /data_out"

echo -e "${YELLOW}Running command:${NC}"
echo "$DOCKER_CMD"
echo ""

# Run Docker command
eval $DOCKER_CMD

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Processing completed successfully!${NC}"
    echo "Results saved to: $OUTPUT_DIR"
    ls -lh "$OUTPUT_DIR"
else
    echo -e "${RED}Processing failed!${NC}"
    exit 1
fi

