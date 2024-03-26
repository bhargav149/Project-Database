import React, { useEffect, useState } from 'react'
import './App.css';
import AddProjectForm from './components/AddProjectForm';
import EditProjectModal from './components/EditProjectModal';
import SideNavigation from './components/SideNavigation';
import ViewProjectModal from './components/ViewProjectModal';
import Toast from './components/Toast';
import SemesterDropdown from './components/SemesterDropdown';
import SearchCategory from './components/SearchCategory';
import DataTable from './components/DataTable';

import { FilePenLine, Plus, X, Sun, Moon, LayoutGrid, Table2, RotateCcw } from 'lucide-react';

function App() {

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('title');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddProjectForm, setShowAddProjectForm] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastFadeOut, setToastFadeOut] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [tableView, setTableView] = useState(false);

  const [availableSemesters, setAvailableSemesters] = useState([]);

  const [selectedStatuses, setSelectedStatuses] = useState({
    'Completed': true,
    'In-Progress': true,
    'Suspended': true,
    'Unassigned': true,
  });
  
  const [selectedSemesters, setSelectedSemesters] = useState([]);
  const [showContinuedProjects, setShowContinuedProjects] = useState(true);
  
  const [editingProject, setEditingProject] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);


  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const semestersFromProjects = new Set(data.flatMap(project => project.semesters));
    const newAvailableSemesters = [...semestersFromProjects];
    console.log("Available Semesters:", newAvailableSemesters); // Debug log
    setAvailableSemesters(newAvailableSemesters);
  }, [data]);
  

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode]);

  useEffect(() => {
    const rootProjects = data.filter(project => project.continuation_of_project_id === -1);
    const continuedProjects = data.filter(project => project.continuation_of_project_id !== -1);
  
    // Create a set of root project IDs that have continuations
    const rootProjectsWithContinuations = new Set(continuedProjects.map(project => project.continuation_of_project_id));
  
    const filteredProjects = rootProjects.filter(project => {
      // Check for direct semester match or through continuations
      const semesterIsSelected = selectedSemesters.length === 0 || semesterMatchesForProject(project);
      // Check for search term match
      const matchesSearchTerm = searchTerm === '' || project[selectedCategory]?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      // Check if status is selected
      const statusIsSelected = selectedStatuses[project.status];
      // If showContinuedProjects is false, exclude root projects that have continuations
      const continuationCriteria = showContinuedProjects || !rootProjectsWithContinuations.has(project.id);
  
      return matchesSearchTerm && statusIsSelected && semesterIsSelected && continuationCriteria;
    });
  
    setFilteredData(filteredProjects);
  }, [data, searchTerm, selectedCategory, selectedStatuses, selectedSemesters, showContinuedProjects]);
  
  const semesterMatchesForProject = (project) => {
    // Check if the project or any of its continuations matches the selected semesters
    const checkSemesters = (projectId) => {
      const relatedProjects = data.filter(p => 
        p.id === projectId || p.continuation_of_project_id === projectId
      );
  
      return relatedProjects.some(p => selectedSemesters.includes(p.semesters));
    };
  
    // Start the check with the current project
    return checkSemesters(project.id);
  };

  const fetchProjects = () => {
    fetch("http://localhost:8080/projects")
      .then(res => res.json())
      .then(data => setData(data.map(project => ({ ...project, isEditing: false }))))
      .catch(err => console.error(err));
  };

  const addProject = (project) => {
    fetch("http://localhost:8080/projects", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: project.title,
        contents: project.contents,
        stack: project.stack,
        team_name: project.team_name,
        team_members: project.team_members,
        status: project.status,
        semesters: project.semesters,
        continuation_of_project_id: project.continuation_of_project_id
      }),
    })
    .then(response => response.json())
    .then(() => {
      fetchProjects();
      showToastWithFadeOut("Successfully added project.");
      setShowAddProjectForm(false);
    })
    .catch(err => console.error(err));
  };
  
  const showToastWithFadeOut = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setToastFadeOut(false); // Reset fade-out animation
  
    setTimeout(() => {
      setToastFadeOut(true); // Start fade-out animation
      setTimeout(() => {
        setShowToast(false);
        setToastFadeOut(false); // Ensure the fade-out state is reset for the next toast
      }, 700); // This duration should match the CSS animation duration for fading out
    }, 10000); // Time the toast is visible before starting to fade out
  };

  // const deleteProject = (id) => {
  //   const isConfirmed = window.confirm("Are you sure you want to delete this project?");
  //   if (!isConfirmed) {
  //     return;
  //   }
  
  //   fetch(`http://localhost:8080/projects/${id}`, {
  //     method: 'DELETE',
  //   })
  //   .then(response => {
  //     if (response.ok) {
  //       setData(data.filter(project => project.id !== id));
  //       showToastWithFadeOut("Project successfully deleted.");
  //     } else {
  //       alert('Failed to delete the project');
  //     }
  //   })
  //   .catch(err => console.error('Error:', err));
  // };  

  const deleteProject = (id) => {
    // Check if there are any child projects.
    const hasChildProjects = data.some(project => project.continuation_of_project_id === id);
    
    // Adjust the confirmation message based on whether there are child projects.
    const confirmMessage = hasChildProjects
      ? "This project has related projects that will also be deleted. Are you sure you want to delete this project and all its related projects?"
      : "Are you sure you want to delete this project?";
    
    const isConfirmed = window.confirm(confirmMessage);
    if (!isConfirmed) {
      return;
    }

    // If there are child projects, delete them first.
    if (hasChildProjects) {
      const childProjectsToDelete = data.filter(project => project.continuation_of_project_id === id);
      const deleteChildProjectsPromises = childProjectsToDelete.map(childProject =>
        fetch(`http://localhost:8080/projects/${childProject.id}`, { method: 'DELETE', })
      );

      Promise.all(deleteChildProjectsPromises)
        .then(() => deleteRootProject(id, true)) // Pass true to indicate child projects were also deleted
        .catch(err => {
          console.error('Failed to delete child projects:', err);
          showToastWithFadeOut("An error occurred while deleting related projects.", true);
        });
    } else {
      // If there are no child projects, directly delete the root project.
      deleteRootProject(id, false); // Pass false as no child projects were deleted
    }
};

const deleteRootProject = (id, deletedChildProjects) => {
    fetch(`http://localhost:8080/projects/${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            setData(data.filter(project => project.id !== id && project.continuation_of_project_id !== id));
            const toastMessage = deletedChildProjects
              ? "Project and all its related projects successfully deleted."
              : "Project successfully deleted.";
            showToastWithFadeOut(toastMessage);
        } else {
            alert('Failed to delete the project');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        showToastWithFadeOut("An error occurred while deleting the project.", true);
    });
};


  // const updateProject = (id, updatedProject) => {
  //   fetch(`http://localhost:8080/projects/${id}`, {
  //     method: 'PUT',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(updatedProject),
  //   })
  //   .then(response => response.json())
  //   .then(() => fetchProjects())
  //   .catch(err => console.error(err));
  // };

  const toggleEdit = (project) => {
    setIsModalOpen(true);
  
    // Determine if the selected project is a root project or a continuation
    const isRootProject = project.continuation_of_project_id === -1;
    const rootProjectId = isRootProject ? project.id : project.continuation_of_project_id;
  
    // Filter for the root project and its continuations
    const projectAndContinuations = data.filter(p => 
      p.id === rootProjectId || p.continuation_of_project_id === rootProjectId
    );
    
    setEditingProject(project); // Keep the selected project as the editing project
    setRelatedProjects(projectAndContinuations); // Update related projects to include continuations
  };
  

  const saveEdit = (updatedProject) => {
    // console.log(`Saving project with updated status: `, updatedProject);
    fetch(`http://localhost:8080/projects/${updatedProject.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProject),
    })
    .then(response => response.json())
    .then(() => {
      setIsModalOpen(false);
      fetchProjects();
      showToastWithFadeOut("Project successfully updated.");
    })
    .catch(err => console.error(err));
  };

  const cancelEdit = () => {
    const isConfirmed = window.confirm("Are you sure you want to discard all changes made?");
    if (isConfirmed) {
      setIsModalOpen(false);
    }
  };

  const getAllSemestersForProject = (projectId) => {
    // Attempt to find the root project in the data array
    const rootProject = data.find(p => p.id === projectId);
  
    // If the rootProject does not exist, return an empty array early
    if (!rootProject) {
      return [];
    }
  
    // Proceed with the original logic if rootProject exists
    const relatedProjects = data.filter(p => 
      p.id === projectId || p.continuation_of_project_id === projectId
    );
  
    const allSemestersSet = new Set();
  
    const addSemesters = (semesters) => {
      if (Array.isArray(semesters)) {
        semesters.forEach(semester => allSemestersSet.add(semester));
      } else if (semesters) {
        allSemestersSet.add(semesters);
      }
    };
  
    addSemesters(rootProject.semesters);
    relatedProjects.forEach(p => addSemesters(p.semesters));
  
    let allSemestersArray = [...allSemestersSet];
  
    const termOrder = ['Spring', 'Summer', 'Fall', 'Winter'];
    allSemestersArray.sort((a, b) => {
      const [termA, yearA] = a.split(' ');
      const [termB, yearB] = b.split(' ');
      const yearComparison = yearA - yearB;
      if (yearComparison !== 0) return yearComparison;
      return termOrder.indexOf(termA) - termOrder.indexOf(termB);
    });
  
    return allSemestersArray;
  };
  
  

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed':
        return 'status-button completed';
      case 'In-Progress':
        return 'status-button in-progress';
      case 'Suspended':
        return 'status-button suspended';
      case 'Unassigned':
        return 'status-button unassigned';
      default:
        return 'status-button';
    }
  };

  const toggleAddProjectForm = () => {
    setShowAddProjectForm(!showAddProjectForm);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    console.log('Search term:', e.target.value);
  };

  // const handleCategoryChange = (e) => {
  //   setSelectedCategory(e.target.value);
  // };

  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
  };

  const handleSort = (criteria, order) => {
    let sortedData = [...data]; // Clone the current data array
  
    if (criteria === 'semester') {
      const termOrder = ['Spring', 'Summer', 'Fall', 'Winter']; // Adjust based on your terms
      sortedData.sort((a, b) => {
        const [termA, yearA] = a.semesters.split(' ');
        const [termB, yearB] = b.semesters.split(' ');
        if (yearA !== yearB) {
          return order === 'asc' ? yearA - yearB : yearB - yearA;
        }
        return order === 'asc' ? termOrder.indexOf(termA) - termOrder.indexOf(termB) : termOrder.indexOf(termB) - termOrder.indexOf(termA);
      });
    }
    else if (criteria === 'status') {
      // Status sorting logic
      const statusOrder = ['In-Progress', 'Unassigned', 'Suspended', 'Completed'];
      sortedData.sort((a, b) => {
        let indexA = statusOrder.indexOf(a.status);
        let indexB = statusOrder.indexOf(b.status);
          return indexA - indexB;
      });
    }
    setData(sortedData);
  };

  const viewProjectDetails = (project) => {
    setEditingProject(project); // Reuse this state to avoid creating a new one
    setIsViewModalOpen(true);
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Here you would also update the CSS classes or variables to apply the theme
  };
  
  const toggleView = () => {
    setTableView(!tableView);
  };

  // const options = [
  //   { value: 'spring_2024', label: 'Spring 2024' },
  //   { value: 'fall_2024', label: 'Fall 2024' },
  // ];

  // const handleSelectionChange = (selectedOptions) => {
  //   console.log('Selected Options:', selectedOptions);
  // };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatuses({
      'Completed': true,
      'In-Progress': true,
      'Suspended': true,
      'Unassigned': true,
    });
    setSelectedSemesters([]);
    setShowContinuedProjects(true);
  };

  const getAllTeamsForProjectSortedBySemester = (projectId) => {
    const projectAndContinuations = data.filter(p => 
      p.id === projectId || p.continuation_of_project_id === projectId
    );
  
    const teamSemesterMap = new Map();
  
    const sortSemesters = (a, b) => {
      const [termA, yearA] = a.split(' ');
      const [termB, yearB] = b.split(' ');
      const yearDiff = parseInt(yearA) - parseInt(yearB);
      if (yearDiff !== 0) return yearDiff;
      const termsOrder = ['Spring', 'Summer', 'Fall', 'Winter'];
      return termsOrder.indexOf(termA) - termsOrder.indexOf(termB);
    };

    projectAndContinuations.forEach(project => {
      const semesters = Array.isArray(project.semesters) ? project.semesters : [project.semesters];
      const earliestSemester = semesters.sort(sortSemesters)[0];
      if (teamSemesterMap.has(project.team_name)) {
        const existingSemester = teamSemesterMap.get(project.team_name);
        if (sortSemesters(earliestSemester, existingSemester) < 0) {
          teamSemesterMap.set(project.team_name, earliestSemester);
        }
      } else {
        teamSemesterMap.set(project.team_name, earliestSemester);
      }
    });
    const sortedTeams = Array.from(teamSemesterMap.entries()).sort((a, b) => sortSemesters(a[1], b[1]));
    return sortedTeams.map(entry => entry[0]);
  };
  
  return (
    <div className={`container ${isDarkMode ? '' : 'light-theme'}`}>
      <header className="site-header">
        <div className="logo">
          <img src={`${process.env.PUBLIC_URL}/vt-logo2.png`} alt="VT Logo" />
        </div>
        <div className="title">
          <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Brave Souls Project Management System
          </a>
        </div>
        <div className="right-section">
          <div className="color-theme" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </div>
          <div className="login">
            <button className="login-button">Logout</button>
          </div>
        </div>
      </header>
  
      {!tableView && (
        <>
          <SideNavigation onSort={handleSort} theme={isDarkMode ? 'dark' : 'light'} />
          <div className="search-container">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-bar"
            />
            <SearchCategory onCategoryChange={handleCategoryChange} themeMode={isDarkMode ? 'dark' : 'light'} />
            <SemesterDropdown
              availableSemesters={availableSemesters}
              selectedSemesters={selectedSemesters}
              setSelectedSemesters={setSelectedSemesters}
              themeMode={isDarkMode ? 'dark' : 'light'}
            />
          </div>
          <div className="status-filter-container">
            {Object.keys(selectedStatuses).map((status) => (
              <div
                key={status}
                className={`status-filter-btn ${status.toLowerCase().replace(' ', '-')} ${selectedStatuses[status] ? '' : 'dimmed'}`}
                onClick={() => setSelectedStatuses(prev => ({ ...prev, [status]: !prev[status] }))}
                >
                {status}
              </div>
            ))}
              <button
                className={`continued-filter-btn ${showContinuedProjects ? '' : 'dimmed'}`}
                onClick={() => setShowContinuedProjects(prev => !prev)}
                >
                Continued
              </button>
              <button onClick={resetFilters} className="reset-button">
                <RotateCcw color={isDarkMode ? "white" : "black"} size={24} />
              </button>
          </div>
        </>
      )}

      <div className="content">
        <button onClick={toggleAddProjectForm} className="add-project-button">
          {showAddProjectForm ? <X color="white" size={24} /> : <Plus color="white" size={24} />}
        </button>
        <button onClick={toggleView} className="view-toggle-button">
          {tableView ? <LayoutGrid size={24}/> : <Table2 size={24}/>}
        </button>

        {tableView ? (
          <DataTable themeMode={isDarkMode ? 'dark' : 'light'}/>
        ) : (
          <div className="cards-container">
            {filteredData.map((project, i) => (
              <div key={i} className="card" onClick={() => viewProjectDetails(project)}>
                <p><strong>Title:</strong> {project.title}</p>
                <p><strong>Description:</strong> {project.contents}</p>
                <p><strong>Stack:</strong> {project.stack}</p>
                <p><strong>Team:</strong> {getAllTeamsForProjectSortedBySemester(project.id).join(', ')}</p>
                {/* <p><strong>Team Members:</strong> {project.team_members}</p> */}
                <p><strong>Semester:</strong> {getAllSemestersForProject(project.id).join(', ')}</p>
                <button className="status-button completed">Completed</button>
                <div className="indicator-container">
                  {data.some(p => p.continuation_of_project_id === project.id) && (
                      <button className="continued-indicator" onClick={(e) => e.stopPropagation()}>
                          Continued
                      </button>
                  )}
                </div>
                <button className="button-delete" onClick={(event) => {
                  event.stopPropagation();
                  deleteProject(project.id);
                }}>Delete</button>
                <span className="button-edit" onClick={(event) => {
                  event.stopPropagation();
                  toggleEdit(project);
                }} style={{ cursor: 'pointer' }}>
                  <FilePenLine />
                </span>
                <button className={getStatusStyle(project.status)}>{project.status}</button>
              </div>
            ))}
          </div>
        )}
      </div>
  
      {showAddProjectForm && (
        <div className="add-project-card">
          <AddProjectForm onAdd={addProject} projects={data} />
        </div>
      )}
  
      {isModalOpen && editingProject && (
        <EditProjectModal
          project={editingProject}
          isOpen={isModalOpen}
          onSave={saveEdit}
          onCancel={cancelEdit}
          relatedProjects={relatedProjects}
        />
      )}
      {isViewModalOpen && editingProject && (
        <ViewProjectModal
          project={editingProject}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          theme={isDarkMode ? 'dark' : 'light'}
        />
      )}
  
      <Toast show={showToast} message={toastMessage} fadeOut={toastFadeOut} />
    </div>
  );  
}

export default App