# Jupyter-Python Template

## Setup

### UV Installation

Install UV through any of the methods described in the [official documentation](https://docs.astral.sh/uv/getting-started/installation/).

### VSCode Extensions

Install the recommended VSCode extensions of this repository (they appear in recommendations when opening up the extensions menu on the left sidebar).

### UV Setup

Execute the following command: `uv sync`, to download all the necessary dependencies to execute the project.

### Kernel Selection

When opening a Jupyter notebook, select the "Python Environments" option and select the one that belongs to this workspace.

## Python Modules

### Coding

To write a Python module, a `.py` file can be added to the `src/template_ipynb`.

## Jupyter Notebooks

### Creation

To add a new Jupyter notebook, create a new file for it inside `src/` and then make a folder for it there.

### Importing Modules

Simply use `import project_name` at any cell.

## Modifications

### Project

#### Name

To modify the name of the project, change the value of the `[project.name]`  and `[project.scripts]` keys in the `pyproject.toml` file, the name of the `src/template_ipynb` folder and the module written in the `.vscode/launch.json` launch configuration. The project name should be in kebab-case, the name of the folder and the launch module should be in snake_case, and the `[project.scripts]` key should be changed to match the casing of `project-name = "project_name:main"`.

#### Description

To modify the description of the project, change the value of the `[project.description]` key in the `pyproject.toml` file and the docstring of the `src/template_ipynb/__init__.py` module.

#### Author/s

To modify the author of the project, change the value of the `[project.authors]` key in the `pyproject.toml` file.

### Python Linting-Formatting

The Python linter-formatter used is Ruff, and can be configured in the `ruff.toml` file (excluded out of view but existing in the folder) or the `pyproject.toml` file, as explained in the [official documentation](https://docs.astral.sh/ruff/settings/). In any case, if any [rules or set of rules](https://docs.astral.sh/ruff/rules/) are to be disabled, they can be added to the ignore array.
