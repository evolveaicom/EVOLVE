import React, { useState, useEffect } from 'react';
import PieChart from './PieChart';
import LineChart from './LineChart';

function StatsDashboard() {
  const [categoryData, setCategoryData] = useState({});
  const [tagCloud, setTagCloud] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      // Load category stats
      const templates = await contract.templateIds();
      const stats = await Promise.all(templates.map(async id => 
        await contract.templateCategoryStats(id)
      ));
      
      // Aggregate category data
      const categoryCounts = stats.reduce((acc, stat) => ({
        OPTIMIZATION: acc.OPTIMIZATION + stat.optimization,
        SECURITY: acc.SECURITY + stat.security,
        GOVERNANCE: acc.GOVERNANCE + stat.governance,
        ECONOMIC: acc.ECONOMIC + stat.economic,
        COMMUNITY: acc.COMMUNITY + stat.community
      }), {});

      setCategoryData(categoryCounts);

      // Load tag cloud
      const tags = Object.keys(await contract.tagUsageCount());
      const tagCounts = await Promise.all(
        tags.map(t => contract.tagUsageCount(t))
      );
      
      setTagCloud(tags.map((t,i) => ({
        tag: t,
        count: tagCounts[i]
      })).sort((a,b) => b.count - a.count).slice(0, 20));
    };
    loadStats();
  }, []);

  return (
    <div className="stats-dashboard">
      <div className="category-chart">
        <h3>Change Distribution by Category</h3>
        <PieChart data={Object.entries(categoryData).map(([name, value]) => ({
          name, value 
        }))} />
      </div>
      
      <div className="tag-cloud">
        <h3>Most Used Tags</h3>
        {tagCloud.map(({tag, count}) => (
          <span key={tag} style={{fontSize: Math.log(count)*10}}>
            {tag} ({count})
          </span>
        ))}
      </div>
    </div>
  );
}

function TimeRangeFilter() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const applyFilter = async () => {
    const start = Math.floor(new Date(startDate).getTime() / 1000);
    const end = Math.floor(new Date(endDate).getTime() / 1000);
    const data = await contract.getChangesByTimeRange(templateId, start, end);
    setFilteredData(data);
  };

  return (
    <div className="time-filter">
      <input
        type="date"
        value={startDate}
        onChange={e => setStartDate(e.target.value)}
      />
      <input
        type="date" 
        value={endDate}
        onChange={e => setEndDate(e.target.value)}
      />
      <button onClick={applyFilter}>Apply Filter</button>
      
      <LineChart data={filteredData.map(d => ({
        date: new Date(d.timestamp*1000).toLocaleDateString(),
        value: d.category
      }))} />
    </div>
  );
}

export default StatsDashboard; 