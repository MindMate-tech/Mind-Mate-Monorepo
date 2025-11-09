# MindMate.tech - MRI Analysis Module

**Built at Hack Princeton by Students**

This repository contains the MRI analysis module for **MindMate.tech**, a comprehensive healthcare platform that integrates advanced brain imaging analysis capabilities. This module utilizes AssemblyNet, a state-of-the-art 3D whole brain MRI segmentation pipeline, to provide detailed brain structure analysis.

![AssemblyNet_report_capture.png](doc/AssemblyNet_report_capture.png)

## About MindMate.tech

**MindMate.tech** is a healthcare technology platform developed by students during Hack Princeton. The platform combines multiple advanced technologies including:

- **MRI Brain Analysis** (this module) - Whole brain segmentation and volumetry analysis
- **Voice Analysis** - Cognitive assessment through speech patterns
- **Patient Monitoring** - Comprehensive patient dashboard and tracking
- **AI-Powered Insights** - Advanced analytics for healthcare professionals

This MRI analysis module leverages **AssemblyNet**, a powerful ensemble of convolutional neural networks that segments T1 MRI scans into 133 distinct brain regions according to the [BrainColor protocol](https://mindboggle.info/braincolor/).

## Features

Given an input T1 MRI image in NIfTI format, MindMate.tech's MRI analysis module produces:

- **Segmentation Images** (in native and MNI spaces):
  - Intracranial cavity masks
  - Brain tissue segmentations
  - Brain macrostructure segmentations
  - Cortical lobe segmentations
  - Cortical and subcortical structure segmentations

- **Analysis Reports**:
  - PDF volumetry reports with normative bounds (when age/sex provided)
  - CSV volumetry reports with detailed measurements
  - Quality control ratings

Example outputs can be found in the [example](example/) directory:
- [Structures](example/mni_structures_my_brain.nii.gz)
- [Macrostructures](example/mni_macrostructures_my_brain.nii.gz)
- [Tissues](example/mni_tissues_my_brain.nii.gz)
- [Lobes](example/mni_lobes_my_brain.nii.gz)
- [Intracranial cavity](example/mni_mask_my_brain.nii.gz)
- [PDF Report](example/report_my_brain.pdf)
- [CSV Report](example/report_my_brain.csv)

## Quick Start

### Prerequisites

- Docker installed (see [Installation](#installation-instructions))
- MRI files in NIfTI format (.nii or .nii.gz)
- For GPU processing: NVIDIA GPU with 8GB+ VRAM

### Quick Installation

Pull the AssemblyNet Docker image:

```bash
sudo docker pull volbrain/assemblynet:1.0.0
```

### Quick Usage

**CPU Processing:**
```bash
sudo docker run --rm -v /path/to/images:/data volbrain/assemblynet:1.0.0 /data/image.nii.gz
```

**GPU Processing (faster):**
```bash
sudo docker run --rm --gpus '"device=0"' -v /path/to/images:/data volbrain/assemblynet:1.0.0 /data/image.nii.gz
```

### EC2 Cloud Setup

For cloud-based processing, see our [EC2 Setup Guide](EC2_SETUP_GUIDE.md) for detailed instructions on setting up MindMate.tech's MRI analysis on Amazon EC2.

## Installation Instructions

### Prerequisites

**For CPU Processing:**
- x86_64 CPU
- At least 6GB RAM
- GNU/Linux (Ubuntu 18.04+ recommended) or Windows 10/11 with WSL
- Docker >= 19.03
- MRI files in NIfTI format

**For GPU Processing (Recommended for Faster Processing):**
- NVIDIA GPU with at least 8GB VRAM
- CUDA Compute capability >= 6.0 (Pascal, Volta, Turing, Ampere architectures)
- GNU/Linux x86_64 with kernel > 3.10
- NVIDIA drivers >= 418.40, 440.33, 450.51, 460.27, or 470.xx
- Docker >= 19.03
- NVIDIA Container Toolkit

### Installation on Ubuntu Linux

#### 1. Install Docker

```bash
# Remove old Docker versions
sudo apt-get remove docker docker-engine docker.io containerd runc

# Install Docker
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

# Verify installation
sudo docker run hello-world

# Add user to docker group (to run without sudo)
sudo usermod -aG docker $USER
# Log out and log back in for changes to take effect
```

#### 2. Install NVIDIA Container Toolkit (GPU only)

```bash
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update
sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker

# Verify GPU access
sudo docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
```

#### 3. Pull AssemblyNet Image

```bash
sudo docker pull volbrain/assemblynet:1.0.0
```

### Installation on Windows 10/11 with WSL

1. Install WSL2 following [Microsoft's instructions](https://docs.microsoft.com/en-us/windows/wsl/install)
2. Install Docker Desktop for Windows with WSL2 backend
3. From WSL terminal, pull the image:
   ```bash
   sudo docker pull volbrain/assemblynet:1.0.0
   ```

### Cloud Installation (EC2)

For detailed EC2 setup instructions, automated scripts, and cloud deployment, see [EC2_SETUP_GUIDE.md](EC2_SETUP_GUIDE.md).

## Usage

### Input Format

MindMate.tech's MRI analysis module accepts:
- **NIfTI format**: `.nii` or `.nii.gz` files
- **T1-weighted MRI scans**

To convert DICOM files to NIfTI, use [dcm2niix](https://github.com/rordenlab/dcm2niix).

### Output Files

For each processed image, the following files are generated:

- `native_t1_*filename*.nii.gz` and `mni_t1_*filename*.nii.gz` - Normalized T1 images
- `native_mask_*filename*.nii.gz` and `mni_mask_*filename*.nii.gz` - Intracranial cavity masks
- `native_tissues_*filename*.nii.gz` and `mni_tissues_*filename*.nii.gz` - Tissue segmentations
- `native_macrostructures_*filename*.nii.gz` and `mni_macrostructures_*filename*.nii.gz` - Macrostructure segmentations
- `native_lobes_*filename*.nii.gz` and `mni_lobes_*filename*.nii.gz` - Lobe segmentations
- `native_structures_*filename*.nii.gz` and `mni_structures_*filename*.nii.gz` - Structure segmentations
- `matrix_affine_native_to_mni_*filename*.txt` - Transformation matrix
- `report_*filename*.pdf` - PDF volumetry report with normative bounds
- `report_*filename*.csv` - CSV volumetry report

**Note:** Output files are approximately 7.5x the input file size.

### Command Options

```bash
[-age <age>] [-sex <sex>] [-age-sex-csv input_csv_filename] [-recursive] 
[-pattern-t1 <pattern>] [-no-pdf-report] [-global-csv output_csv_filename] 
[-batch-size <batchSize>] <input image or directory> [output directory]
```

**Key Options:**
- `-age <age>` - Patient age in years (float) - enables normative bounds in reports
- `-sex <sex>` - Patient sex ("Male" or "Female") - enables sex-specific normative bounds
- `-recursive` - Process all images recursively in directory
- `-global-csv <filename>` - Generate combined CSV for all processed images
- `-batch-size <N>` - Process N images simultaneously (default: 3)

### Usage Examples

**Single file with age and sex:**
```bash
sudo docker run --rm --gpus '"device=0"' \
  -v /path/to/images:/data \
  volbrain/assemblynet:1.0.0 \
  -age 50 -sex Male /data/image.nii.gz
```

**Batch processing:**
```bash
sudo docker run --rm --gpus '"device=0"' \
  -v /path/to/input:/data \
  -v /path/to/output:/data_out \
  volbrain/assemblynet:1.0.0 \
  -recursive -pattern-t1 "*.nii.gz" \
  -global-csv /data_out/results.csv \
  /data /data_out
```

**Using MindMate.tech EC2 scripts:**
```bash
# On EC2 instance
./ec2_run_assemblynet.sh brain_scan.nii.gz 50 Male
```

## Processing Time

Approximate processing times per image:
- **CPU (t3.xlarge)**: 15-20 minutes
- **GPU (g4dn.xlarge)**: 7-10 minutes
- **CPU (m7.large)**: 20-25 minutes

Processing time depends on hardware configuration, disk speed, and batch size.

## Integration with MindMate.tech Platform

This MRI analysis module integrates with the broader MindMate.tech platform:

- **API Integration**: Results can be accessed via the MindMate.tech API
- **Patient Dashboard**: MRI analysis results appear in patient dashboards
- **Longitudinal Tracking**: Compare MRI scans over time to track progression
- **Automated Alerts**: System flags abnormalities based on normative bounds

For API integration examples, see the main MindMate.tech repository.

## Normative Ranges

MindMate.tech includes normative ranges for brain volumes based on age and sex:
- `bounds_female.csv` - Female-specific normative bounds
- `bounds_male.csv` - Male-specific normative bounds  
- `bounds_general.csv` - General normative bounds (age only)

These ranges are based on analysis of 3000+ cognitively normal subjects and are automatically used in reports when age/sex are provided.

## License and Attribution

**This Docker image is to be used only for non-commercial and non-medical purposes (research only).**

### AssemblyNet Citation

If you use AssemblyNet (the underlying segmentation engine), please cite:

Pierrick Coupé, Boris Mansencal, Michaël Clément, Rémi Giraud, Baudouin Denis de Senneville, Vinh-Thong Ta, Vincent Lepetit, José V. Manjon  
[AssemblyNet: A large ensemble of CNNs for 3D whole brain MRI segmentation](https://dx.doi.org/10.1016/j.neuroimage.2020.117026).  
NeuroImage, Elsevier, 2020, 219, pp.117026.  
[[paper]](https://dx.doi.org/10.1016/j.neuroimage.2020.117026) [[bibtex]](doc/AssemblyNet.bib)

### MindMate.tech

**MindMate.tech** - Built at Hack Princeton by Students

This MRI analysis module is part of the MindMate.tech healthcare platform. For more information about the full platform, visit the main MindMate.tech repository.

### Additional Licenses

- CUDA End User License Agreement applies for GPU usage
- AssemblyNet uses binaries from [SPM8](https://www.fil.ion.ucl.ac.uk/spm/software/spm8/), [N4ITK](), and [ANTs](https://github.com/ANTsX/ANTs)

## Support and Documentation

- **EC2 Setup**: See [EC2_SETUP_GUIDE.md](EC2_SETUP_GUIDE.md)
- **Setup Scripts**: Automated setup available in `ec2_setup_script.sh`
- **Run Scripts**: Helper script `ec2_run_assemblynet.sh` for easy processing
- **Main Platform**: See main MindMate.tech repository for full platform documentation

## Contributing

This project was developed during Hack Princeton. For contributions or questions about MindMate.tech, please refer to the main repository.

---

**MindMate.tech** - Advanced Healthcare Technology Platform  
*Built at Hack Princeton by Students*
