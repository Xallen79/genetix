using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace GenetixEditor.Settings
{
    class BaseResource
    {
        [JsonProperty("rid")]
        public string RId { get; set; }
        [JsonProperty("name")]
        public string Name { get; set; }
        [JsonProperty("desc")]
        public string Description { get; set; }
        [JsonProperty("attr")]
        public string Attribute { get; set; }
        [JsonProperty("jids")]
        public object[] JIds { get; set; }


        internal void AddNodes(TreeNode root)
        {
            root.Nodes.Add("rid").Nodes.Add(this.RId);
            root.Nodes.Add("name").Nodes.Add(this.Name);
            root.Nodes.Add("desc").Nodes.Add(this.Description);
            root.Nodes.Add("attr").Nodes.Add(this.Attribute);

            var jobNode = root.Nodes.Add("jids");
            if (this.JIds == null || this.JIds.Length == 0) jobNode.Nodes.Add("");
            else
            {
                foreach (var jid in this.JIds)
                {
                    var node = jobNode.Nodes.Add(jid.ToString());
                }
            }
            


        }
    }
}
