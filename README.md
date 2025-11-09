# MindMate Monorepo

This repository contains the entire MindMate platform, a tool for doctors to monitor the condition of Alzheimer's patients over time.

## Overview

Mindmate is an AI-centric tool for doctors to monitor the condition of Alzheimer's patients over time with input from different sources such as MRI scans, diagnoses, and patient conversations.

The high-level architecture consists of:
- **Two Frontends**: A `doctor-frontend` for clinicians and a `stellar-mind-companion` for patients.
- **A Core Backend**: A central API (`backend`) that manages data and orchestrates calls to specialized AI services.
- **AI/ML Models**: A suite of models for cognitive analysis from transcripts (`models`), MRI scan analysis (`mri_analysis_model`), and voice analysis (`voice_models`).
- **Central Database & Storage**: Supabase is used as the primary data and file storage.

## Project Structure

The monorepo is organized as follows:

```
/
├── doctor-frontend/        # Next.js app for clinicians
├── models/                 # Python models for cognitive analysis
├── mri_analysis_model/     # Model for MRI segmentation
├── stellar-mind-companion/ # React + Vite app for patients
└── voice_models/           # Python project for voice-based dementia detection
```

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 20.x or higher.
- **npm** or **yarn**: For managing Node.js dependencies.
- **Python**: Version 3.11 or higher.
- **uv**: A fast Python package installer (`pip install uv`).
- **Docker**: For running the containerized MRI analysis model.
- **A Supabase Account**: You will need a free Supabase project.

### Central Setup: Supabase

Most services depend on Supabase. Set it up first.

1.  **Create a Supabase Project**: Go to [supabase.com](https://supabase.com), create an account, and start a new project.
2.  **Get API Credentials**: In your project's dashboard, navigate to **Project Settings > API**. You will need the following:
    - **Project URL**
    - **`anon` public key**
    - **`service_role` secret key**
3.  **Run Schema SQL**: Navigate to the **SQL Editor** in your Supabase dashboard. Open and execute the contents of `stellar-mind-companion/supabase_schema.sql` to create the necessary tables and policies.
4.  **Create MRI Storage Bucket**: Navigate to **Storage** in the dashboard. Create a new private bucket named `mri_images`. This is required for the MRI upload feature in the `doctor-frontend`.

### Running the applications

Each application can be run from its respective directory. Please refer to the `README.md` file in each directory for specific instructions on how to run each application.