import React, { useEffect, useState } from 'react'
import AddProjectForm from './AddProjectForm';
import EditProjectModal from './EditProjectModal';
import SideNavigation from './SideNavigation';
import ViewProjectModal from './ViewProjectModal';
import Toast from './Toast';
import SemesterDropdown from './SemesterDropdown';
import SearchCategory from './SearchCategory';
import DataTable from './DataTable';
import SettingsPage from './Settings';

import { FilePenLine, Plus, X, Sun, Moon, LayoutGrid, Table2, RotateCcw, Settings, Undo2 } from 'lucide-react';
import './LandingPage.css';


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

  const [notes, setNotes] = useState([]);

  const [settingsView, setSettingsView] = useState(false);

  //USE FIRST URL FOR LOCAL DEVELOPMENT AND SECOND FOR DEPLOYMENT
  const url = "http://localhost:8080/";
  // const url = "https://bravesouls-projectdb.discovery.cs.vt.edu/server/"

  const [user, setUser] = React.useState('pid1');
  const [isAdmin,setIsAdmin]=useState(false);

  const [userProject, setUserProject] = React.useState(null);
  const [userRootProject, setUserRootProject] = useState(-1);
  const [toastError, setToastError] = React.useState(false)


  // useEffect(() => {
  //   getCurrentUser();
  // }, []);

  // async function getCurrentUser() {
  //   await fetch("/api/currentUser")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       console.log("CAS data", data)
  //       setUser(data.user)
  //     });
  // }


  useEffect(() => {
    getUserProject();
  });

  useEffect(() => {
    fetchProjects();
  }, []);



  useEffect(() => {
    if (data && data.length > 0) {
      const semestersFromProjects = new Set(data.flatMap(project => project.semesters));
      // console.log("semesters from projects: ", semestersFromProjects)
      const newAvailableSemesters = [...semestersFromProjects];
      // console.log("new available Semesters:", newAvailableSemesters);
      setAvailableSemesters(newAvailableSemesters);
    }
  }, [data]);
  

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode]);

  useEffect(() => {
    const rootProjects = data.filter(project => project.continuation_of_project_id === -1);
    const continuedProjects = data.filter(project => project.continuation_of_project_id !== -1);
  
    // Create a set of root project IDs that have continuations
    const rootProjectsWithContinuations = new Set(continuedProjects.map(project => project.continuation_of_project_id));

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
  
    const filteredProjects = rootProjects.filter(project => {
      // Check for direct semester match or through continuations
      const semesterIsSelected = selectedSemesters.length === 0 || semesterMatchesForProject(project);
      // Check for search term match
      const matchesSearchTerm = searchTerm === '' || project[selectedCategory]?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      // Check if status is selected
      const mostRecentStatus = getMostRecentStatus(project.id);
      const statusIsSelected = selectedStatuses[mostRecentStatus];
      // If showContinuedProjects is false, exclude root projects that have continuations
      const continuationCriteria = showContinuedProjects || !rootProjectsWithContinuations.has(project.id);
  
      return matchesSearchTerm && statusIsSelected && semesterIsSelected && continuationCriteria;
    });
  
    setFilteredData(filteredProjects);
  }, [data, searchTerm, selectedCategory, selectedStatuses, selectedSemesters, showContinuedProjects]);
  


  const fetchProjects = () => {
    fetch(url+"projects")
      .then(res => res.json())
      .then(data => setData(data.map(project => ({ ...project, isEditing: false }))))
      .catch(err => console.error(err));
  };

  const getUserProject =() => {
    fetch(url+"user/"+user)
    .then(res => res.json())
    .then(data => {
      // console.log("Fetched user project: ", data, data.project_id)
      setUserProject(data.project_id);
      // console.log("Current user's project: ", userProject)
      getUserRootProject()
    })
    .catch(error => {
      // console.error("Error fetching user project:", error);
    });
  }

  const getUserRootProject =() => {
    fetch(url+"projects/"+userProject)
    .then(res => res.json())
    .then(data => {
      // console.log("Fetched project row: ", data)
      if (data && data.length > 0) {
        const rootId = data[0].continuation_of_project_id;
        if(rootId===-1){
          setUserRootProject(userProject);
        }
        else{
          setUserRootProject(rootId)
        }
      }
      else {
        // console.log("No project data found");
      }
      // console.log("Current user's root project: ", userRootProject)
    })
    .catch(error => {
      console.error("Error fetching user root project:", error);
    });
  }


  const addProject = (project) => {
    fetch(url+"projects", {
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
    .then((data) => {
      if (data !== null) {
        fetchProjects();
        showToastWithFadeOut("Successfully added project.");
        setShowAddProjectForm(false);
      } else {
        showErrorToastWithFadeOut("Project title already exists; please choose a different name or continue an existing project");
      }
    })
    .catch(err => console.error(err));
    fetchProjects();
  };
  
  const showToastWithFadeOut = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setToastFadeOut(false); // Reset fade-out animation
    setToastError(false)
  
    setTimeout(() => {
      setToastFadeOut(true); // Start fade-out animation
      setTimeout(() => {
        setShowToast(false);
        setToastFadeOut(false); // Ensure the fade-out state is reset for the next toast
      }, 700); // This duration should match the CSS animation duration for fading out
    }, 10000); // Time the toast is visible before starting to fade out
  };

  const showErrorToastWithFadeOut = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setToastFadeOut(false); // Reset fade-out animation
    setToastError(true)
  
    setTimeout(() => {
      setToastFadeOut(true); // Start fade-out animation
      setTimeout(() => {
        setShowToast(false);
        setToastFadeOut(false); // Ensure the fade-out state is reset for the next toast
      }, 700); // This duration should match the CSS animation duration for fading out
    }, 10000); // Time the toast is visible before starting to fade out
  };

  


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
        fetch(url+`projects/${childProject.id}`, { method: 'DELETE', })
      );

      Promise.all(deleteChildProjectsPromises)
        .then(() => deleteRootProject(id, true)) // Pass true to indicate child projects were also deleted
        .catch(err => {
          console.error('Failed to delete child projects:', err);
          showErrorToastWithFadeOut("An error occurred while deleting related projects.", true);
        });
    } else {
      // If there are no child projects, directly delete the root project.
      deleteRootProject(id, false); // Pass false as no child projects were deleted
    }
};

const deleteRootProject = (id, deletedChildProjects) => {
    fetch(url+`projects/${id}`, {
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
        showErrorToastWithFadeOut("An error occurred while deleting the project.", true);
    });
};

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

    const fetchNotesForProjects = async () => {
      try {
        const notesPromises = projectAndContinuations.map(proj =>
          fetch(`${url}projects/${proj.id}/notes`).then(res => res.json())
        );
        const notesArrays = await Promise.all(notesPromises);
        // Flatten the array of arrays and set the notes
        const allNotes = [].concat(...notesArrays);
        setNotes(allNotes);
      } catch (err) {
        console.error("Failed to fetch notes for related projects:", err);
      }
    };
  
    fetchNotesForProjects();
  };
  
  const saveEdit = async (updatedProject) => {
    // console.log(`Saving project with updated status: `, updatedProject);
    try {
      const response = await fetch(url + `projects/${updatedProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProject),
      });
      if (!response.ok) {
        throw new Error("Failed to update project");
      }
      setIsModalOpen(false);
      fetchProjects(); // Update project data after save
      showToastWithFadeOut("Project successfully updated.");
    } catch (error) {
      console.error(error);
      showErrorToastWithFadeOut("An error occurred while updating the project.", true);
    }
  };

  const afterJoin = async () => {
    showToastWithFadeOut("Project joined successfully");
    setTimeout(() => {
      window.location.reload();
    }, 1000);  };

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
  const compareSemesters = (a,b,order) => {
    const termOrder = ['Spring', 'Summer', 'Fall', 'Winter']; // Adjust based on your terms
    console.log("Sem A", a)
    console.log("Sem B", b)
      const [termA, yearA] = a.split(' ');
      const [termB, yearB] = b.split(' ');
      if (yearA !== yearB) {
        return order === 'asc' ? yearA - yearB : yearB - yearA;
      }
      return order === 'asc' ? termOrder.indexOf(termA) - termOrder.indexOf(termB) : termOrder.indexOf(termB) - termOrder.indexOf(termA);
  }
  const getMostRecentContinuation = (projectId) => {
    const projectAndContinuations = data.filter(p => 
      p.id === projectId || p.continuation_of_project_id === projectId
    );  
    console.log("continuations",projectId,projectAndContinuations)
    let mostRecentSemester = null;
    let mostRecent = null;
    projectAndContinuations.forEach(project => {
      console.log("project", project)
      if (!mostRecent || compareSemesters(project.semesters,mostRecentSemester,'asc')>0) {
        mostRecentSemester = project.semesters;
        mostRecent = project
      }
    });
    return mostRecent;
  }
  const handleSort = (criteria, order) => {
    let sortedData = [...data]; // Clone the current data array
  
    if (criteria === 'semester') {
      sortedData.sort((a, b) => {
        const semesterA = getMostRecentContinuation(a.id).semesters;
        const semesterB = getMostRecentContinuation(b.id).semesters;
        console.log("comparing semesters")
        return compareSemesters(semesterA, semesterB, order);
      });
    }
    else if (criteria === 'status') {
      // Status sorting logic
      const statusOrder = ['In-Progress', 'Unassigned', 'Suspended', 'Completed'];
      sortedData.sort((a, b) => {
        const statusA = getMostRecentContinuation(a.id).status;
        const statusB = getMostRecentContinuation(b.id).status;
        let indexA = statusOrder.indexOf(statusA);
        let indexB = statusOrder.indexOf(statusB);
          return indexA - indexB;
      });
    }
    setData(sortedData);
  };

  const viewProjectDetails = async (project) => {
    setIsViewModalOpen(true);
    setEditingProject(project); // Assuming you're reusing this for viewing
  
    // Fetch related projects
    const rootProjectId = project.continuation_of_project_id === -1 ? project.id : project.continuation_of_project_id;
    const projectAndContinuations = data.filter(p => 
      p.id === rootProjectId || p.continuation_of_project_id === rootProjectId
    );
    setRelatedProjects(projectAndContinuations);

    // Fetch notes for all related projects
  const notesPromises = projectAndContinuations.map(proj =>
    fetch(`${url}projects/${proj.id}/notes`).then(res => res.json())
  );

  try {
    const notesArrays = await Promise.all(notesPromises);
    // Flatten the array of arrays and set the notes
    const allNotes = [].concat(...notesArrays);
    setNotes(allNotes);
  } catch (err) {
    console.error("Failed to fetch notes for related projects:", err);
  }
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    fetchProjects();
  };
  
  const toggleView = () => {
    setTableView(!tableView);
    fetchProjects();
  };

  const toggleSettingsView = () => {
    setSettingsView(!settingsView);
    fetchProjects();
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
      // console.log("Semesters",a.semesters,b.semesters)
      if(a==null||a.semesters==null) {
        return 0
      }
      const [termA, yearA] = a.split(' ');
      if(b==null || b.semesters==null) {
        return -1
      }
      const [termB, yearB] = b.split(' ');
      const yearDiff = parseInt(yearA) - parseInt(yearB);
      if (yearDiff !== 0) return yearDiff;
      const termsOrder = ['Spring', 'Summer', 'Fall', 'Winter'];
      return termsOrder.indexOf(termA) - termsOrder.indexOf(termB);
    };
    console.log("Project id", projectId)
    console.log("All projects", projectAndContinuations)
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

   const fetchAdminData=async (adminId)=> {
    try {
        const response = await fetch(url+`admins/${adminId}`);
        if (!response.ok) {
            throw new Error('Admin data not found');
        }
        return await response.json();
    } catch (error) {
        throw new Error('Error fetching admin data');
    }
};

fetchAdminData(user)
    .then(admin => {
        setIsAdmin(admin !== null && admin !== undefined); // Check if admin object exists
        // console.log('Is admin:', isAdmin);
        // console.log(user)
        // You can use the value of 'isAdmin' in your application logic
    })
    .catch(error => {
        setIsAdmin(false)
        console.error('Error:', error.message);
        // Handle error appropriately
    });

  const revertToPreviousView = () => {
    setSettingsView(false); // Assuming you want to leave settings view when undo is clicked
  };

  const getMostRecentStatus = (projectId) => {
    // Collect all related projects including the root and its continuations
    const relatedProjects = data.filter(p => 
      p.id === projectId || p.continuation_of_project_id === projectId
    );
  
    // Sort projects by semester and year
    const sortedProjects = relatedProjects.sort((a, b) => {
      console.log("Semesters",a.semesters,b.semesters)
      const [termA, yearA] = a.semesters.split(' ');
      if(b.semesters==null) {
        return -1
      }
      const [termB, yearB] = b.semesters.split(' ');
      const yearDiff = yearA - yearB;
      if (yearDiff !== 0) return yearDiff; // Sort by year first
      return termA === 'Spring' ? -1 : 1; // Assuming only Spring and Fall, sort Spring before Fall
    });
  
    // The last project in the sorted array is the most recent
    return sortedProjects.length > 0 ? sortedProjects[sortedProjects.length - 1].status : '';
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
          <div className="logout">
            <a href="/api/logout">
              <button className="login-button">Logout</button>
            </a>
          </div>
        </div>
      </header>
  
      {!tableView && !settingsView && (
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
        

        {isAdmin ? 
        (<><button onClick={toggleView} className="view-toggle-button">
          {tableView ? <LayoutGrid size={24}/> : <Table2 size={24}/>}
        </button>
              <button onClick={toggleAddProjectForm} className="add-project-button">
              {showAddProjectForm ? <X color="white" size={24} /> : <Plus color="white" size={24} />}
            </button></>) : (<></>)}


        <button onClick={toggleSettingsView} className="settings-toggle-button">
          {settingsView ? <Undo2 size={24}/> : <Settings size={24}/>}
        </button>

        { settingsView ? (
        <SettingsPage themeMode={isDarkMode ? 'dark' : 'light'} data={data} isAdmin={isAdmin} isRootProject={userProject.id===userRootProject.id} pid={user}/>
      ) :
      tableView ? (
          <DataTable themeMode={isDarkMode ? 'dark' : 'light'} data={data} />) : (
          <div className="cards-container">
            {filteredData.map((project, i) => (
              <div key={i} className="card" onClick={() => viewProjectDetails(project)}>
                <p><strong>Title:</strong> {project.title}</p>
                <p><strong>Description:</strong> {project.contents}</p>
                <p><strong>Stack:</strong> {project.stack}</p>
                <p><strong>Team:</strong> {getAllTeamsForProjectSortedBySemester(project.id).join(', ')}</p>
                {/* <p><strong>Team Members:</strong> {project.team_members}</p> */}
                <p><strong>Semester:</strong> {getAllSemestersForProject(project.id).join(', ')}</p>
                {/* <p><strong>Repository Link:</strong> {project.repository}</p> */}
                {/* <p><strong>Production URL:</strong> {project.production_url}</p> */}
                <button className="status-button suspended">Completed</button>
                
                <div className="indicator-container">
                  {data.some(p => p.continuation_of_project_id === project.id) && (
                      <button className="continued-indicator" onClick={(e) => e.stopPropagation()}>
                          Continued
                      </button>
                  )}
                </div>
                {
                  isAdmin ? (
                    <button className="button-delete" onClick={(event) => {
                      event.stopPropagation();
                      deleteProject(project.id);
                    }}>Delete</button>
                  ) : (
                    <></>
                  )
                }

                {isAdmin || userRootProject===project.id ?
                  (<><span className="button-edit" onClick={(event) => {
                    event.stopPropagation();
                    toggleEdit(project);
                  } } style={{ cursor: 'pointer' }}>
                    <FilePenLine />
                  </span></>) :
                  <></>
                }
              {/* <button className={getStatusStyle(project.status)}>{project.status}</button> */}
              <button className={getStatusStyle(getMostRecentStatus(project.id))}>
        {getMostRecentStatus(project.id)}
      </button>
              </div>
            ))}
          </div>
        )}
      </div>
  
      {showAddProjectForm && (
          <div className={`${isDarkMode ? 'add-project-card' : 'add-project-card-light'}`}>
            <AddProjectForm onAdd={addProject} projects={data} theme = {isDarkMode ? 'dark' : 'light'}/>
        </div>
      )}
  
      {isModalOpen && editingProject && (
        <EditProjectModal
          project={editingProject}
          isOpen={isModalOpen}
          onSave={saveEdit}
          onCancel={cancelEdit}
          relatedProjects={relatedProjects}
          isAdmin={isAdmin}
          projectId={userProject}
          pid={user}
          notes={notes}
          theme={isDarkMode ? 'dark' : 'light'}
        />
      )}
      {isViewModalOpen && editingProject && (
        <ViewProjectModal
          project={editingProject}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
          }}
          theme={isDarkMode ? 'dark' : 'light'}
          relatedProjects={relatedProjects}
          notes={notes}
          pid={user}
          isAdmin={isAdmin}
          afterJoin={afterJoin}
        />
      )}
  
      <Toast show={showToast} message={toastMessage} fadeOut={toastFadeOut} error={toastError} />
    </div>
    
  );  
}

export default App