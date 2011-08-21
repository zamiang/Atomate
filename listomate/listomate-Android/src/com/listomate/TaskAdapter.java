package com.listomate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;

import android.content.Context;
import android.text.format.DateFormat;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;

import com.listomate.shared.TaskProxy;

public class TaskAdapter extends BaseAdapter {

    private final static class ViewHolder {
        TextView title;
        TextView date;
    }

    private Comparator<TaskProxy> taskComparator = new Comparator<TaskProxy>() {
        public int compare(TaskProxy object1, TaskProxy object2) {
            Date date1 = object1.getDueDate();
            Date date2 = object2.getDueDate();
            if (date1 != null) {
                if (date2 != null) {
                    return date1.compareTo(date2);
                } else {
                    return -1;
                }
            } else {
                if (date2 != null) {
                    return 1;
                }
            }
            return 0;
        }
    };

    private final List<TaskProxy> items = new ArrayList<TaskProxy>();
    private final LayoutInflater inflater;

    private java.text.DateFormat dateFormat;

    public TaskAdapter(Context context) {
        inflater = (LayoutInflater) context
                .getSystemService(Context.LAYOUT_INFLATER_SERVICE);

        dateFormat = DateFormat.getDateFormat(context);
    }

    public void setTasks(List<TaskProxy> items) {
        this.items.clear();
        this.items.addAll(items);
        Collections.sort(this.items, taskComparator);
    }

    public void addTasks(List<TaskProxy> items) {
        this.items.addAll(items);
        Collections.sort(this.items, taskComparator);
    }

    public TaskProxy get(int position) {
        return items.get(position);
    }

    public int getCount() {
        return items.size();
    }

    public Object getItem(int position) {
        return items.get(position);
    }

    public long getItemId(int position) {
        return position;
    }

    public View getView(int position, View convertView, ViewGroup view) {
        ViewHolder holder;
        if (convertView == null) {
            convertView = inflater.inflate(R.layout.listitem, null);

            holder = new ViewHolder();
            holder.title = (TextView) convertView.findViewById(R.id.taskTitle);
            holder.date = (TextView) convertView.findViewById(R.id.taskDate);
            convertView.setTag(holder);
        } else {
            holder = (ViewHolder) convertView.getTag();
        }

        TaskProxy task = items.get(position);

        holder.title.setText(task.getName());
        Date dueDate = task.getDueDate();
        if (dueDate != null) {
            holder.date.setText(dateFormat.format(dueDate));
        }

        return convertView;
    }
}
